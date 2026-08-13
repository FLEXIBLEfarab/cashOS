using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class BatchConfiguration : IEntityTypeConfiguration<Batch>
{
    public void Configure(EntityTypeBuilder<Batch> builder)
    {
        builder.ToTable("batches");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.BatchNumber).HasColumnName("batch_number").HasMaxLength(100).IsRequired();
        builder.Property(e => e.InitialQuantity).HasColumnName("initial_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(e => e.CurrentQuantity).HasColumnName("current_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(e => e.IsBlocked).HasColumnName("is_blocked").IsRequired();
        builder.Property(e => e.BlockedReason).HasColumnName("blocked_reason").HasMaxLength(500);
        builder.Property(e => e.ReceivedAt).HasColumnName("received_at").IsRequired();
        builder.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        builder.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId);
        builder.HasOne(e => e.Supplier).WithMany().HasForeignKey(e => e.SupplierId);
        builder.HasIndex(e => e.ExpirationDate);
        builder.HasIndex(e => e.IsBlocked);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
