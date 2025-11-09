import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Record } from './record.entity';

@Entity()
export class HeartRate extends PrimaryEntity {
  @Column()
  value: number;

  @ManyToOne(() => Record, (record) => record.heartRate)
  record: Record;
}
