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

@Entity('prices')
@Index(['product_id', 'branch_id'], { unique: true })
@Index(['product_id'])
@Index(['branch_id'])
@Check(`"value" >= 0`)
export class Price {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product, (product) => product.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  branch_id: string | null;

  @ManyToOne(() => Branch, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch | null;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  value: number;

  @Column({ type: 'date', nullable: true })
  valid_from: Date | null;

  @Column({ type: 'date', nullable: true })
  valid_until: Date | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;
}
