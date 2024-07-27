import { PrimaryEntity } from 'src/common/entities/primary.entity';
import { Entity, Column } from 'typeorm';

@Entity()
export class Disease extends PrimaryEntity {
  @Column({ nullable: false, unique: true })
  slug: string;

  @Column()
  name: string;

  @Column('text')
  html: string;

  @Column()
  references: string;
}
