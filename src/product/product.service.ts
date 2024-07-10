import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { UUID } from 'crypto';
import { ProductPrice } from './entities/product-purchase-price.entity';
import { UpdateProductDto } from './dto/update-product.dto';
import { SupplierService } from 'src/supplier/supplier.service';
import { RetailPrice } from './entities/retail-price.entity';
import { WholesalePrice } from './entities/wholesale-price.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly supplierService: SupplierService,
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const product = plainToClass(Product, createProductDto);
      if (createProductDto.suppliers) {
        const suppliersPromises = createProductDto.suppliers.map(
          async (item) => {
            const supplier = await this.supplierService.findOne(item);
            if (!supplier) {
              throw new BadRequestException(
                `Supplier with ID ${item} not found`,
              );
            }
            return supplier;
          },
        );
        const suppliers = await Promise.all(suppliersPromises);
        product.suppliers = suppliers;
      }

      // Create a new ProductPrice instance
      const initialPrice = new ProductPrice();
      initialPrice.price = createProductDto.purchasePrice;
      initialPrice.timestamp = new Date();
      product.purchasePrice = [initialPrice];

      //Create a new WholesalePrice instance
      const initialWholesalePrice = new WholesalePrice();
      initialWholesalePrice.price = createProductDto.wholesalePrice;
      initialPrice.timestamp = new Date();
      product.wholesalePrice = [initialWholesalePrice];

      //Create a new RetailPrice instance
      const initialRetailPrice = new RetailPrice();
      initialRetailPrice.price = createProductDto.retailPrice;
      initialPrice.timestamp = new Date();
      product.retailPrice = [initialRetailPrice];

      // Save the product to the database
      const savedProduct = await this.productRepository.save(product);
      return savedProduct;
    } catch (error) {
      // Handle any errors that occur during the process
      throw error;
    }
  }
  async createAndUpdate(id: UUID, updateProductDto: UpdateProductDto) {
    try {
      // Fetch the existing product
      const existingProduct = await this.productRepository.findOne({
        where: { id },
        relations: [
          'purchasePrice',
          'suppliers',
          'retailPrice',
          'wholesalePrice',
        ],
      });
      if (!existingProduct) {
        throw new BadRequestException(`Product with ID ${id} not found`);
      }

      // Update quantity regardless of price changes
      existingProduct.quantity += updateProductDto.quantity;

      if (updateProductDto.supplier) {
        const supplier = await this.supplierService.findOne(
          updateProductDto.supplier,
        );

        if (!supplier) {
          throw new BadRequestException(
            `Supplier with ID ${updateProductDto.supplier} not found`,
          );
        }

        // Check if the supplier is not already in the array before adding
        if (!existingProduct.suppliers.find((s) => s.id === supplier.id)) {
          existingProduct.suppliers.push(supplier);
        }
      }

      // Check if purchase prices are different
      const latestPurchasePrice =
        existingProduct.purchasePrice?.[
          existingProduct.purchasePrice.length - 1
        ];

      if (
        Number(latestPurchasePrice?.price) !== updateProductDto.purchasePrice
      ) {
        // Prices are different, create a new ProductPrice entry
        const newPurchasePrice = new ProductPrice();
        newPurchasePrice.price = updateProductDto.purchasePrice;
        newPurchasePrice.timestamp = new Date();

        // Overwrite the purchasePrice array
        existingProduct.purchasePrice = [
          ...existingProduct.purchasePrice,
          newPurchasePrice,
        ];

        existingProduct.name = updateProductDto.name;
      }

      // Check if retail price is different
      const latestRetailPrice =
        existingProduct.retailPrice?.[existingProduct.retailPrice.length - 1];

      if (latestRetailPrice?.price !== updateProductDto.retailPrice) {
        const newRetailPrice = new RetailPrice();
        newRetailPrice.price = Number(updateProductDto.retailPrice);
        newRetailPrice.timestamp = new Date();

        // Overwrite the retailPrice array
        existingProduct.retailPrice = [
          ...existingProduct.retailPrice,
          newRetailPrice,
        ];
      }

      // Check if wholesale price is different
      const latestWholesalePrice =
        existingProduct.wholesalePrice?.[
          existingProduct.wholesalePrice.length - 1
        ];

      if (latestWholesalePrice?.price !== updateProductDto.wholesalePrice) {
        const newWholesalePrice = new WholesalePrice();
        newWholesalePrice.price = Number(updateProductDto.wholesalePrice);
        newWholesalePrice.timestamp = new Date();

        // Overwrite the wholesalePrice array
        existingProduct.wholesalePrice = [
          ...existingProduct.wholesalePrice,
          newWholesalePrice,
        ];
      }

      // Save the updated product
      await this.productRepository.save(existingProduct);

      return existingProduct;
    } catch (error) {
      // Handle any errors that occur during the process
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.productRepository.find({
        relations: [
          'suppliers',
          'purchasePrice',
          'retailPrice',
          'wholesalePrice',
        ],
      });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: UUID) {
    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: [
          'suppliers',
          'purchasePrice',
          'retailPrice',
          'wholesalePrice',
        ], // Specify the name of the relation property
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      return product;
    } catch (error) {
      throw error;
    }
  }
  async findBySupplier(id: UUID) {
    try {
      const product = await this.productRepository.findOne({
        relations: ['suppliers'], // Load the suppliers associated with the product
        where: {
          suppliers: {
            id: id,
          },
        },
      });

      return product || null;
    } catch (error) {
      throw error;
    }
  }

  async update(id: UUID, updateProductDto: UpdateProductDto) {
    try {
      // Check if the product exists
      const existingProduct = await this.productRepository.findOne({
        where: { id },
        relations: [
          'purchasePrice',
          'suppliers',
          'retailPrice',
          'wholesalePrice',
        ],
      });

      if (!existingProduct) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      if (updateProductDto.suppliers) {
        const suppliersPromises = updateProductDto.suppliers.map(
          async (item) => {
            const supplier = await this.supplierService.findOne(item);
            if (!supplier) {
              throw new BadRequestException(
                `Supplier with ID ${item} not found`,
              );
            }
            return supplier;
          },
        );
        const suppliers = await Promise.all(suppliersPromises);
        existingProduct.suppliers = suppliers;
      }
      existingProduct.name = updateProductDto.name;
      existingProduct.quantity = updateProductDto.quantity;
      existingProduct.subQuantity = updateProductDto.subQuantity;
      existingProduct.purchasePrice[
        existingProduct.purchasePrice.length - 1
      ].price = updateProductDto.purchasePrice;
      existingProduct.retailPrice[
        existingProduct.retailPrice.length - 1
      ].price = updateProductDto.retailPrice;
      existingProduct.wholesalePrice[
        existingProduct.wholesalePrice.length - 1
      ].price = updateProductDto.wholesalePrice;

      // Save the updated product
      await this.productRepository.save(existingProduct);

      return { success: true, message: 'Product updated successfully' };
    } catch (error) {
      // Handle any errors that occur during the process
      throw error;
    }
  }

  async remove(id: UUID) {
    try {
      // Find the product with associated suppliers and supplier bills
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['suppliers'],
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      // Check if the product is associated with any suppliers or supplier bills
      if (
        (product.suppliers && product.suppliers.length > 0) ||
        (product.supplierBill && product.supplierBill.length > 0)
      ) {
        throw new BadRequestException(
          `Product with ID ${id} is associated with suppliers or supplier bills and cannot be deleted`,
        );
      }

      // Delete the product since it's not associated with any suppliers or supplier bills
      await this.productRepository.delete(id);

      return { message: 'Customer deleted.', id };
    } catch (error) {
      throw error;
    }
  }
}
