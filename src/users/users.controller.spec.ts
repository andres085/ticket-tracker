import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UsersModule } from './users.module';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';


const generateToken = async (app: INestApplication) => {

  const response = await request(app.getHttpServer()).post(`/users/auth/register`).send({
    "username": "Test",
    "password": "Test123",
    "email": "test@mail.com",
    "role": "admin"
  })

  let token: string = response.body.token

  return token;
}

describe('UsersController', () => {
  let app: INestApplication;
  let token: string;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [UsersModule,
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          database: 'ticket-tracker-test',
          username: 'postgres',
          password: 'postgres',
          autoLoadEntities: true,
          synchronize: false,
        })],
      providers: [{ provide: ConfigService, useValue: new ConfigService({ JWT_SECRET: process.env.JWT_SECRET }) }]
    }).compile();

    app = module.createNestApplication();
    await app.init()

    dataSource = app.get(DataSource)

    token = await generateToken(app)
  });

  afterEach(async () => {
    const entities = dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = dataSource.getRepository(entity.name);

      await repository.query(`DELETE FROM ${entity.tableName}`)
    }
  })

  it('should call the get users endpoint', async () => {
    const userId = 1;
    const expectedUser = { id: userId, name: 'Paco' }
    console.log({ token })

    const response = await request(app.getHttpServer()).get(`/users/${userId}`).set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toEqual(expectedUser)
  });
});
