import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
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
