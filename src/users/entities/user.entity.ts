import { BeforeInsert, BeforeUpdate, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

  @Column('text', { unique: true, select: false })
  password: string;

  @Column('text')
  email: string;

  @Column('enum', {
    enum: UserRole,
    default: UserRole.USER
  })
  role: UserRole;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLowerCase().trim();
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
