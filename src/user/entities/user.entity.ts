import { Role } from 'src/auth/enums/role.enum';
import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class User extends PrimaryEntity {
  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
    nullable: true, // Make roles optional
    default: [Role.User], // Provide a default value if needed
  })
  roles: Role[];
}
