import { POSITION } from 'src/auth/enums/position.enum';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Department } from 'src/department/entities/department.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  OneToOne,
} from 'typeorm';

@Entity()
export class Staff extends PrimaryEntity {
  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: POSITION,
  })
  position: POSITION;

  @Column()
  phone: string;

  @Column()
  photo: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @ManyToMany(() => Department, (department) => department.doctors)
  @JoinTable()
  departments: Department[];
}
