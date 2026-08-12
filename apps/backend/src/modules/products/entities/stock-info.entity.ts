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
  Check,
} from 'typeorm';
import { Product } from './product.entity';
import { Branch } from '../../multi-store/entities/branch.entity';
import { Warehouse } from '../../multi-store/entities/warehouse.entity';

@Entity('stock_info')
@Index(['product_id', 'branch_id', 'warehouse_id'], { unique: true })
@Index(['product_id'])
@Index(['branch_id'])
@Index(['warehouse_id'])
@Check(`"quantity" >= 0`)
@Check(`"reserved_quantity" >= 0`)
export class StockInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.stock_info, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid' })
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'uuid', nullable: true })
  warehouse_id: string | null;

  @ManyToOne(() => Warehouse, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse | null;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  reserved_quantity: number;

  @Column({ type: 'decimal', precision: 15, scale: 3, default: 0 })
  min_quantity: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;
}
