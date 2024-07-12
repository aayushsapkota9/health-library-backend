import { PrimaryEntity } from 'src/common/dto/primary.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, JoinColumn, OneToOne } from 'typeorm';

export class Doctor extends PrimaryEntity {
  @Column()
  phoneNo: string;

  @Column()
  fullAddress: string;

  @Column()
  documentFront: string;

  @Column()
  documentBack: string;

  @Column()
  organization: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
