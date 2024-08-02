import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { HeightUnits } from 'src/enums/height-unit.enums';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { BloodOxygen } from './blood-oxygen.entity';
import { BodyTemperature } from './temperature.entity';
import { HeartRate } from './heart-rate.entity';
import { BloodPressure } from './blood-pressure.entity';
import { Test } from 'src/tests/entities/test.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { Prescription } from 'src/prescriptions/entities/prescription.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { RecordStatus } from 'src/auth/enums/status.enums';

@Entity()
export class Record extends PrimaryEntity {
  @Column({ type: 'float' })
  weight: number;

  @Column({
    type: 'float',
  })
  height: number;

  @Column({
    type: 'enum',
    enum: HeightUnits,
  })
  heightUnit: string;

  @Column({
    type: 'simple-array',
  })
  symptoms: string[];

  @Column()
  remarks: string;

  @Column()
  warningMessage: string;

  @Column({
    type: 'enum',
    enum: RecordStatus,
    default: RecordStatus.ADMITTED,
  })
  status: RecordStatus;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dischargedDate: Date;

  @OneToMany(() => BloodOxygen, (bloodOxygen) => bloodOxygen.record)
  bloodOxygen: BloodOxygen[];

  @OneToMany(() => BodyTemperature, (bodyTemperature) => bodyTemperature.record)
  bodyTemperature: BodyTemperature[];

  @OneToMany(() => HeartRate, (heartRate) => heartRate.record)
  heartRate: HeartRate[];

  @OneToMany(() => BloodPressure, (bloodPressure) => bloodPressure.record)
  bloodPressure: HeartRate[];

  @OneToMany(() => Test, (test) => test.record)
  tests: Test[];

  @OneToMany(() => Task, (task) => task.record)
  tasks: Task[];

  @OneToMany(() => Prescription, (prescription) => prescription.record)
  prescriptions: Prescription[];

  @ManyToOne(() => Patient, (patient) => patient.records)
  patient: Patient;
}
