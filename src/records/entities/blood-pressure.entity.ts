import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Record } from './record.entity';

@Entity()
export class BloodPressure extends PrimaryEntity {
  @Column({ type: 'timestamp' })
  time: Date;

  @Column()
  systolic: number;

  @Column()
  diastolic: number;

  @ManyToOne(() => Record, (record) => record.bloodPressure)
  record: Record;
}
