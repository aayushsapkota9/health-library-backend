import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';
import { DepartmentValue } from 'src/interfaces/enums/department.enums';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity()
export class Department extends PrimaryEntity {
  @Column()
  value: DepartmentValue;

  @ManyToOne(() => Hospital, (hospital) => hospital.departments)
  hospital: Hospital;

  @ManyToMany(() => Doctor, (doctor) => doctor.departments)
  doctors: Doctor[];

  @OneToMany(() => Appointment, (appointment) => appointment.department)
  appointments: Appointment[];
}
