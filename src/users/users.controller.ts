import { Controller, Post, Body, UseGuards, Get, Param, Patch, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto, LoginUserDto } from './dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('auth/register')
  //@UseGuards(AuthGuard())
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('auth/login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.usersService.login(loginUserDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':id')
  @UseGuards(AuthGuard())
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(+id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(+id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }
}
