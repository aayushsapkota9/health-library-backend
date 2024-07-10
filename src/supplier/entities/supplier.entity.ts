import { Product } from 'src/product/entities/product.entity';
import { SupplierBill } from 'src/supplier-bill/entities/supplier-bill.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  // One supplier can have many bills
  @OneToMany(() => SupplierBill, (supplierBill) => supplierBill.supplier)
  bills: SupplierBill[];

  // One supplier can have many products
  @ManyToMany(() => Product, (product) => product.suppliers)
  @JoinTable()
  products: Product[];
}
