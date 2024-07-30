import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { Staff } from 'src/staff/entities/staff.entity';
import { Hospital } from 'src/hospital/entities/hospital.entity';
import { DepartmentValue } from 'src/enums/department.enums';

@Entity()
export class Department extends PrimaryEntity {
  @Column()
  value: DepartmentValue;

  @ManyToOne(() => Hospital, (hospital) => hospital.departments)
  hospital: Hospital;

  @ManyToMany(() => Staff, (doctor) => doctor.departments)
  doctors: Staff[];
}
