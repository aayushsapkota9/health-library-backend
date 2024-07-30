import { Role } from 'src/auth/enums/role.enum';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends PrimaryEntity {
  @Column({ nullable: true })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
  })
  role: Role;
}
