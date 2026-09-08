import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ShiftStatus {
  OPEN = 'open',
  CLOSED = 'closed',
}

@Entity('shifts')
@Index(['terminalId'])
@Index(['cashierId'])
@Index(['status'])
@Index(['openedAt'])
export class ShiftEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'terminal_id' })
  terminalId: string;

  @Column({ type: 'uuid', name: 'cashier_id' })
  cashierId: string;

  @Column({ type: 'timestamptz', name: 'opened_at' })
  openedAt: Date;

  @Column({ type: 'timestamptz', name: 'closed_at', nullable: true })
  closedAt: Date | null;

  @Column({
    type: 'enum',
    enum: ShiftStatus,
    default: ShiftStatus.OPEN,
  })
  status: ShiftStatus;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'opening_cash' })
  openingCash: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true, name: 'closing_cash' })
  closingCash: number | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  @Column({ type: 'int', default: 0, name: 'total_sales_count' })
  totalSalesCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'total_sales_amount' })
  totalSalesAmount: number;

  @Column({ type: 'int', default: 0, name: 'refunds_count' })
  refundsCount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'refunds_amount' })
  refundsAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'cash_total' })
  cashTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'card_total' })
  cardTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'kaspi_pay_total' })
  kaspiPayTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'qr_total' })
  qrTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'cash_in_total' })
  cashInTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0, name: 'cash_out_total' })
  cashOutTotal: number;

  @Column({ type: 'jsonb', nullable: true, name: 'cash_in_out_operations' })
  cashInOutOperations: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
