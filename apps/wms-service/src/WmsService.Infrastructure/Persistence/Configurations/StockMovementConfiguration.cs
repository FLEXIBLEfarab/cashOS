using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");

        builder.HasKey(m => m.Id);
        builder.Property(m => m.Id).ValueGeneratedNever();

        builder.Property(m => m.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(m => m.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(m => m.BatchId).HasColumnName("batch_id");
        builder.Property(m => m.MovementType).HasColumnName("movement_type").IsRequired();
        builder.Property(m => m.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(m => m.UnitPrice).HasColumnName("unit_price").HasPrecision(18, 2);
        builder.Property(m => m.TotalAmount).HasColumnName("total_amount").HasPrecision(18, 2);
        builder.Property(m => m.DocumentId).HasColumnName("document_id").HasMaxLength(100).IsRequired();
        builder.Property(m => m.DocumentType).HasColumnName("document_type").HasMaxLength(50).IsRequired();
        builder.Property(m => m.Reason).HasColumnName("reason").HasMaxLength(500);
        builder.Property(m => m.PerformedBy).HasColumnName("performed_by").HasMaxLength(100).IsRequired();
        builder.Property(m => m.PerformedAt).HasColumnName("performed_at").IsRequired();
        builder.Property(m => m.SourceWarehouseId).HasColumnName("source_warehouse_id");
        builder.Property(m => m.DestinationWarehouseId).HasColumnName("destination_warehouse_id");
        builder.Property(m => m.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(m => m.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(m => m.Product).WithMany(p => p.StockMovements).HasForeignKey(m => m.ProductId);
        builder.HasOne(m => m.Warehouse).WithMany(w => w.StockMovements).HasForeignKey(m => m.WarehouseId);
        builder.HasOne(m => m.Batch).WithMany(b => b.StockMovements).HasForeignKey(m => m.BatchId);

        builder.HasIndex(m => m.WarehouseId);
        builder.HasIndex(m => m.ProductId);
        builder.HasIndex(m => m.BatchId);
        builder.HasIndex(m => m.MovementType);
        builder.HasIndex(m => m.PerformedAt);
        builder.HasIndex(m => m.DocumentId);
    }
}
