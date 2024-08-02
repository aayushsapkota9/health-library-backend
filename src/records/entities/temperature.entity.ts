import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Record } from './record.entity';

@Entity()
export class BodyTemperature extends PrimaryEntity {
  @Column({ type: 'timestamp' })
  time: Date;

  @Column() // in celsius
  value: number;

  @ManyToOne(() => Record, (record) => record.bodyTemperature)
  record: Record;
}
