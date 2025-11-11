import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, ILike, Repository } from 'typeorm';
import { Disease } from './entities/disease.entity';
import { SearchService } from 'src/search/search.service';
import { generateSlug } from 'src/helpers/slug.helper';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';

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
      const slug = generateSlug(createDiseaseDto.name);
      const existingName = await this.findBySlug(slug);
      if (existingName) {
        throw new BadRequestException(
          'Disease already exists, try changing the name',
        );
      }
      const disease = this.diseaseRepository.create(createDiseaseDto);
      disease.slug = slug;
      await this.searchService.indexDisease(disease);
      await queryRunner.manager.save(disease);

      await queryRunner.commitTransaction();
      return disease;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: PaginationDto) {
    const data = await this.diseaseRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      select: ['name', 'slug', 'createdAt', 'references', 'id'],
    });
    return paginateResponse(data, query);
  }

  findOne(id: string) {
    return this.diseaseRepository.findOne({ where: { id } });
  }

  findBySlug(slug: string) {
    return this.diseaseRepository.findOne({ where: { slug } });
  }

  async update(id: string, updateDiseaseDto: UpdateDiseaseDto) {
    console.log(id, updateDiseaseDto);
  }

  async remove(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const disease = await this.diseaseRepository.findOneBy({ id });
      if (!disease) {
        throw new BadRequestException('Disease not found');
      }

      await this.searchService.delete(disease);

      await queryRunner.manager.delete(Disease, id);

      await queryRunner.commitTransaction();
      return { message: 'Disease removed successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async search(paginationDto: PaginationDto) {
    return this.searchService.searchDiseasesBySymptomsD(paginationDto);
  }
  async searchByAlphabet(query: PaginationDto) {
    return this.diseaseRepository.find({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      where: { name: ILike(`${query.query}%`) }, // Use ILike for case-insensitive search
    });
  }
}
