import { PrimaryEntity } from 'src/common/dto/primary.entity';
import { Column } from 'typeorm';

export class Doctor extends PrimaryEntity {
  @Column()
  phone_no: string;

  @Column()
  fullAddress: string;

  @Column()
  document_front: string;

  @Column()
  document_back: string;

  @Column()
  organization: string;
}
