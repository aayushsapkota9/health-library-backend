import { DataSource } from 'typeorm';
import { NestFactory } from '@nestjs/core';
import { DbModule } from './db.module';
import { seedData } from './seed-data';

async function runSeeder() {
  const app = await NestFactory.create(DbModule);
  const dataSource = app.get(DataSource);
  await seedData(dataSource);
  await app.close();
}

runSeeder();
