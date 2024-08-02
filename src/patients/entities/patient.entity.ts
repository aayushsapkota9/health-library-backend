import { Gender } from 'src/auth/enums/gender.enum';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Record } from 'src/records/entities/record.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class Patient extends PrimaryEntity {
  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  dateOfBirth: Date;

  @Column({
    type: 'enum',
    enum: Gender,
  })
  gender: Gender;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @OneToMany(() => Record, (record) => record.patient)
  records: Record[];
}
