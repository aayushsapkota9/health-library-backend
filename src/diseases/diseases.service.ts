import { Injectable } from '@nestjs/common';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Injectable()
export class DiseasesService {
  create(createDiseaseDto: CreateDiseaseDto) {
    console.log(createDiseaseDto);
    return 'This action adds a new disease';
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
}
