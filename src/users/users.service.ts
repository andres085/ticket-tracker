import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';

import * as bcrypt from 'bcrypt';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private readonly jwtService: JwtService) { }

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    try {
      const { password, email } = loginUserDto;

      const user = await this.userRepository.findOne({ where: { email }, select: { email: true, password: true, id: true } });

      if (!user) throw new UnauthorizedException('Invalid credentials');

      if (!bcrypt.compareSync(password, user.password)) throw new UnauthorizedException('Invalid credentials');

      return {
        ...user,
        token: this.getJwtToken({ id: user.id })
      };
    } catch (error) {
      this.handleDBErrors(error)
    }

  }

  async getUsers() {
    try {
      const users = await this.userRepository.find();

      return users;
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async getUser(id: number) {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) throw new NotFoundException('User not found');

      return user;

    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.userRepository.findOneBy({ id });

      if (!user) throw new NotFoundException('User not found');

      Object.assign(user, updateUserDto)

      return await this.userRepository.save(user)
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async deleteUser(id: number) {
    try {
      const userToDelete = await this.userRepository.findOneBy({ id });

      if (!userToDelete) throw new NotFoundException('User not found');

      return await this.userRepository.remove(userToDelete)
    } catch (error) {
      this.handleDBErrors(error)
    }
  }


  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign((payload))
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    if (error.code !== 500) throw error;

    throw new InternalServerErrorException('Please check server logs');
  }
}
