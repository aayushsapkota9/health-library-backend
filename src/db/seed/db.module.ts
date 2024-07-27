import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from '../dbconfig';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => TypeOrmConfig,
    }),
  ],
})
export class DbModule {}
