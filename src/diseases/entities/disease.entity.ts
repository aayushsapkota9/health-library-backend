import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Disease {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column({ nullable: false, unique: true })
  slug: string;

  @Column()
  name: string;

  @Column('text')
  html: string;

  @Column()
  references: string;
}
