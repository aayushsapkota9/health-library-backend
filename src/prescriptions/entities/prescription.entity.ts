import { FrequencyEnum } from 'src/auth/enums/frequency.enum';
import { PrescriptionType } from 'src/auth/enums/prescriptioin.enum';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Record } from 'src/records/entities/record.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Prescription extends PrimaryEntity {
  @Column()
  name: string;

  @Column()
  type: PrescriptionType;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ type: 'timestamp' })
  endDate: Date;

  @Column()
  notes: string;

  @Column({
    type: 'enum',
    enum: FrequencyEnum,
  })
  frequency: FrequencyEnum;

  @Column()
  amount: number;

  @Column({
    type: 'timestamp',
  })
  takenTime: Date;

  @ManyToOne(() => Record, (record) => record.prescriptions)
  record: Record;
}
