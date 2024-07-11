import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';

export const TypeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'healthlibrarydb',
  entities: [User],
  synchronize: true,
  autoLoadEntities: true,
};
