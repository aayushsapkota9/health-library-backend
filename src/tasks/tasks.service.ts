import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { RecordsService } from 'src/records/records.service';
import { PaginationDto } from 'src/helpers/pagination.dto';
import { paginateResponse } from 'src/helpers/pagination';
import { StaffService } from 'src/staff/staff.service';
import { TaskStatus } from 'src/auth/enums/status.enums';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    private readonly recordService: RecordsService,
    private readonly staffService: StaffService,
  ) {}
  async create(createTaskDto: CreateTaskDto) {
    const { recordId, staffId, ...others } = createTaskDto;
    const task = this.taskRepository.create(others);
    const record = await this.recordService.findOne(recordId);
    task.record = record;
    const staff = await this.staffService.findOne(staffId);
    task.staff = staff;
    return this.taskRepository.save(task);
  }

  async findAll(query: PaginationDto) {
    const data = await this.taskRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      order: { [query.sortBy]: query.sortOrder },
      relations: ['record', 'staff'],
    });
    return paginateResponse(data, query);
  }
  async findByStatus(query: PaginationDto, status: TaskStatus) {
    const data = await this.taskRepository.findAndCount({
      skip: (query.page - 1) * query.limit,
      take: query.limit,
      where: { status },
      order: { [query.sortBy]: query.sortOrder },
      relations: ['record', 'record.patient', 'record.patient.user', 'staff'],
    });
    return paginateResponse(data, query);
  }
  findOne(id: string) {
    return this.taskRepository.findOne({
      where: { id },
      relations: ['record', 'staff'],
    });
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { recordId, ...others } = updateTaskDto;
    const task = await this.findOne(id);
    const record = await this.recordService.findOne(recordId);
    Object.assign(task, others);
    task.record = record;
    return this.taskRepository.save(task);
  }

  remove(id: string) {
    return this.taskRepository.softRemove({ id });
  }
}
