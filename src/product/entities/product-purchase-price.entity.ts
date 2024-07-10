import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { Exclude } from 'class-transformer';

const numericTransformer = {
  from: (value: string | number) =>
    typeof value === 'string' ? +value : value,
  to: (value: number) => value,
};
@Entity()
export class ProductPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'numeric', transformer: numericTransformer })
  price: number;

  @CreateDateColumn({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => Product, (product) => product.purchasePrice, {
    onDelete: 'CASCADE', // Add this line to automatically delete prices when the associated product is deleted
  })
  @JoinColumn({ name: 'product_id' }) // Specify the foreign key column name
  @Exclude() // Exclude to avoid circular reference
  product: Product;
}
