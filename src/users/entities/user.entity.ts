import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
  USER = 'user',
  SUPPORT = 'support',
  ADMIN = 'admin'
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { unique: true })
  username: string;

  @Column('text', { unique: true })
  password: string;

  @Column('text')
  email: string;

  @Column('enum', {
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;
}
