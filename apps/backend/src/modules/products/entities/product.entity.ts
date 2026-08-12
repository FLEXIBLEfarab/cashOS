import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Check,
} from 'typeorm';
import { Category } from './category.entity';
import { Brand } from './brand.entity';
import { Unit } from './unit.entity';
import { Tax } from './tax.entity';
import { Barcode } from './barcode.entity';
import { ProductImage } from './product-image.entity';
import { Price } from './price.entity';
import { StockInfo } from './stock-info.entity';

@Entity('products')
@Index(['sku'], { unique: true })
@Index(['name'])
@Index(['category_id'])
@Index(['brand_id'])
@Index(['is_active'])
@Index(['deleted_at'])
@Check(`"purchase_price" >= 0`)
@Check(`"weight" >= 0`)
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', nullable: true })
  category_id: string | null;

  @ManyToOne(() => Category, (category) => category.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'category_id' })
  category: Category | null;

  @Column({ type: 'uuid', nullable: true })
  brand_id: string | null;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand | null;

  @Column({ type: 'uuid', nullable: true })
  unit_id: string | null;

  @ManyToOne(() => Unit, (unit) => unit.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit | null;

  @Column({ type: 'uuid', nullable: true })
  tax_id: string | null;

  @ManyToOne(() => Tax, (tax) => tax.products, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'tax_id' })
  tax: Tax | null;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  purchase_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  weight: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  weight_unit: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => Barcode, (barcode) => barcode.product, { cascade: true })
  barcodes: Barcode[];

  @OneToMany(() => ProductImage, (image) => image.product, { cascade: true })
  images: ProductImage[];

  @OneToMany(() => Price, (price) => price.product, { cascade: true })
  prices: Price[];

  @OneToMany(() => StockInfo, (stock) => stock.product, { cascade: true })
  stock_info: StockInfo[];
}
