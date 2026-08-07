using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.ToTable("batches");

        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id).ValueGeneratedNever();

        builder.Property(b => b.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(b => b.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(b => b.BatchNumber).HasColumnName("batch_number").HasMaxLength(100).IsRequired();
        builder.Property(b => b.ProductionDate).HasColumnName("production_date");
        builder.Property(b => b.ExpirationDate).HasColumnName("expiration_date");
        builder.Property(b => b.InitialQuantity).HasColumnName("initial_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(b => b.CurrentQuantity).HasColumnName("current_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(b => b.IsBlocked).HasColumnName("is_blocked").IsRequired();
        builder.Property(b => b.BlockedReason).HasColumnName("blocked_reason").HasMaxLength(500);
        builder.Property(b => b.SupplierId).HasColumnName("supplier_id");
        builder.Property(b => b.ReceivedAt).HasColumnName("received_at").IsRequired();
        builder.Property(b => b.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(b => b.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(b => b.Product).WithMany(p => p.Batches).HasForeignKey(b => b.ProductId);
        builder.HasOne(b => b.Warehouse).WithMany(w => w.Batches).HasForeignKey(b => b.WarehouseId);
        builder.HasOne(b => b.Supplier).WithMany().HasForeignKey(b => b.SupplierId);

        builder.HasIndex(b => b.BatchNumber);
        builder.HasIndex(b => b.ExpirationDate);
        builder.HasIndex(b => b.IsBlocked);
        builder.HasIndex(b => new { b.ProductId, b.WarehouseId });
    }
}
