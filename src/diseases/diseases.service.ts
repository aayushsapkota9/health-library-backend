import { Injectable } from '@nestjs/common';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Disease } from './entities/disease.entity';
import { SearchService } from 'src/search/search.service';
import { generateSlug } from 'src/helpers/slug.helper';
import { PaginationDto } from 'src/helpers/pagination.dto';

@Injectable()
export class DiseasesService {
  constructor(
    @InjectRepository(Disease)
    private diseaseRepository: Repository<Disease>,
    private searchService: SearchService,
    private dataSource: DataSource,
  ) {}
  async create(createDiseaseDto: CreateDiseaseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const disease = this.diseaseRepository.create(createDiseaseDto);
      disease.slug = generateSlug(createDiseaseDto.name);
      await queryRunner.manager.save(disease);
      await this.searchService.indexDisease(disease);

      await queryRunner.commitTransaction();
      return disease;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all diseases`;
  }

  findOne(id: number) {
    return `This action returns a #${id} disease`;
  }

  update(id: number, updateDiseaseDto: UpdateDiseaseDto) {
    console.log(updateDiseaseDto);
    return `This action updates a #${id} disease`;
  }

  remove(id: number) {
    return `This action removes a #${id} disease`;
  }

  async search(paginationDto: PaginationDto) {
    return this.searchService.searchDisease(paginationDto.query);
  }
}
