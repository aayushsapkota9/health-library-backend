import { TaskStatus } from 'src/auth/enums/status.enums';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Record } from 'src/records/entities/record.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Task extends PrimaryEntity {
  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
  })
  status: TaskStatus;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'time' })
  dueTime: Date;

  @ManyToOne(() => Staff, (staff) => staff.tasks)
  staff: Staff;

  @ManyToOne(() => Record, (record) => record.tasks)
  record: Record;
}
