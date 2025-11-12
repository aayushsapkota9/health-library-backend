import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Record } from './record.entity';
import { float } from '@elastic/elasticsearch/lib/api/types';

@Entity()
export class BodyTemperature extends PrimaryEntity {
  @Column('float') // in celsius
  value: float;

  @ManyToOne(() => Record, (record) => record.bodyTemperature)
  record: Record;
}
