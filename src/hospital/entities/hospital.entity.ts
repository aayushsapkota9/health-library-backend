import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Department } from 'src/department/entities/department.entity';
import { Doctor } from 'src/doctors/entities/doctor.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity()
export class Hospital extends PrimaryEntity {
  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  noOfGeneralBeds: number;

  @Column()
  noOfICUBeds: number;

  @Column()
  noOfEmergencyBeds: number;

  @Column()
  image: string;

  @Column()
  backgroundImage: string;

  @Column({ nullable: true })
  latitude: string;

  @Column({ nullable: true })
  longitude: string;

  @OneToMany(() => Doctor, (doctor) => doctor.hospital)
  doctors: Doctor[];

  @OneToMany(() => Department, (department) => department.hospital)
  departments: Department[];
}
