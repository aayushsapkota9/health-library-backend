import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { RecordsModule } from 'src/records/records.module';
import { StaffModule } from 'src/staff/staff.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task]), RecordsModule, StaffModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
