import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('sales')
@Index(['shiftId'])
@Index(['terminalId'])
@Index(['cashierId'])
@Index(['createdAt'])
export class SaleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'shift_id' })
  shiftId: string;

  @Column({ type: 'uuid', name: 'terminal_id' })
  terminalId: string;

  @Column({ type: 'uuid', name: 'cashier_id' })
  cashierId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 50, name: 'payment_method' })
  paymentMethod: string;

  @Column({ type: 'jsonb', name: 'items' })
  items: any[];

  @Column({ type: 'jsonb', nullable: true, name: 'split_payments' })
  splitPayments: any[] | null;

  @Column({ type: 'jsonb', nullable: true, name: 'fiscal_receipt' })
  fiscalReceipt: any | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
