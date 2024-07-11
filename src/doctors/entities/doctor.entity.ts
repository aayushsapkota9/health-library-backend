import { PrimaryEntity } from 'src/common/dto/primary.entity';
import { Column } from 'typeorm';

export class Doctor extends PrimaryEntity {
  @Column()
  phone_no: string;

  @Column()
  fullAddress: string;

  @Column('simple-array')
  documents: string[];

  @Column()
  organization: string;
}
