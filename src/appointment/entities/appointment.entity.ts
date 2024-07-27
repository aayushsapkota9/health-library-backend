import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Department } from 'src/department/entities/department.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Appointment extends PrimaryEntity {
  @Column()
  date: Date;

  @Column()
  fullName: string;

  @Column()
  phoneNo: string;

  @Column()
  condition: string;

  @ManyToOne(() => Department, (department) => department.appointments)
  department: Department;

  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  doctor: Doctor;
}
