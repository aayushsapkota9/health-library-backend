import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Department } from 'src/department/entities/department.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

@Entity()
export class Hospital extends PrimaryEntity {
  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  noOfBeds: number;

  @Column()
  logo: string;

  @OneToMany(() => Department, (department) => department.hospital)
  departments: Department[];

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
