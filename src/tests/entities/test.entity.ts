import { Attention } from 'src/auth/enums/attention.enum';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Record } from 'src/records/entities/record.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Test extends PrimaryEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Attention,
  })
  attention: Attention;

  @Column()
  description: string;

  @Column()
  remarks: string;

  @Column()
  file: string;

  @ManyToOne(() => Staff, (staff) => staff.tests)
  staff: Staff;

  @ManyToOne(() => Record, (record) => record.tests)
  record: Record;
}
