import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { SupplierBill } from 'src/supplier-bill/entities/supplier-bill.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { ProductPrice } from './product-purchase-price.entity';
import { RetailPrice } from './retail-price.entity';
import { WholesalePrice } from './wholesale-price.entity';
import { UUID } from 'crypto';

const numericTransformer = {
  from: (value: string | number) =>
    typeof value === 'string' ? +value : value,
  to: (value: number) => value,
};
@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column()
  name: string;

  @Column({ type: 'numeric', transformer: numericTransformer })
  quantity: number;

  @Column({ type: 'numeric', transformer: numericTransformer })
  subQuantity: number;

  @OneToMany(() => ProductPrice, (price) => price.product, { cascade: true })
  purchasePrice: ProductPrice[];

  @OneToMany(() => RetailPrice, (price) => price.product, { cascade: true })
  retailPrice: RetailPrice[];

  @OneToMany(() => WholesalePrice, (price) => price.product, { cascade: true })
  wholesalePrice: WholesalePrice[];

  @ManyToMany(() => Supplier, (supplier) => supplier.products)
  suppliers: Supplier[];

  @ManyToMany(() => Supplier, (supplier) => supplier.products)
  supplierBill: SupplierBill[];
}
