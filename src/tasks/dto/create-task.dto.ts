import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsDateString } from 'class-validator';
import { TaskStatus } from 'src/auth/enums/status.enums';

export class CreateTaskDto {
  @ApiProperty({
    description: 'The name of the task',
    example: 'Complete project documentation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A description of the task',
    example: 'Include details about the project requirements and goals.',
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'The status of the task',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  status: TaskStatus;

  @ApiProperty({
    description: 'The due date for the task',
    example: '2024-08-15T00:00:00Z',
  })
  @IsDateString()
  dueDate: Date;

  @ApiProperty({
    description: 'The due time for the task',
    example: '19:20',
  })
  @IsNotEmpty()
  dueTime: string;

  @ApiProperty({
    description: 'Additional record or notes related to the task',
    example: 'Task record for tracking purposes.',
  })
  @IsString()
  @IsNotEmpty()
  recordId: string;

  @ApiProperty({
    description: 'Additional record or notes related to the task',
    example: 'Task record for tracking purposes.',
  })
  @IsString()
  @IsNotEmpty()
  staffId: string;
}
