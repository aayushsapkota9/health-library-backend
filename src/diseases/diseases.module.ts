import { Module } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { DiseasesController } from './diseases.controller';
import { Disease } from './entities/disease.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Disease]), SearchModule],
  controllers: [DiseasesController],
  providers: [DiseasesService],
})
export class DiseasesModule {}
