import { Appointment } from 'src/appointment/entities/appointment.entity';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Department } from 'src/department/entities/department.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';
import { User } from 'src/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

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

  @ManyToOne(() => Hospital, (hospital) => hospital.doctors)
  hospital: Hospital;

  @ManyToMany(() => Department, (department) => department.doctors)
  @JoinTable()
  departments: Department[];

  @OneToMany(() => Appointment, (appointment) => appointment.doctor)
  appointments: Appointment[];
}
