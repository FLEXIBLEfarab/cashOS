using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class ExpirationCheckLogConfiguration : IEntityTypeConfiguration<ExpirationCheckLog>
{
    public void Configure(EntityTypeBuilder<ExpirationCheckLog> builder)
    {
        builder.ToTable("expiration_check_logs");

        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();

        builder.Property(e => e.BatchId).HasColumnName("batch_id").IsRequired();
        builder.Property(e => e.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(e => e.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(e => e.CheckDate).HasColumnName("check_date").IsRequired();
        builder.Property(e => e.DaysUntilExpiration).HasColumnName("days_until_expiration");
        builder.Property(e => e.IsExpired).HasColumnName("is_expired").IsRequired();
        builder.Property(e => e.IsExpiringSoon).HasColumnName("is_expiring_soon").IsRequired();
        builder.Property(e => e.ActionTaken).HasColumnName("action_taken").HasMaxLength(500);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(e => e.Batch).WithMany().HasForeignKey(e => e.BatchId);
        builder.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        builder.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId);

        builder.HasIndex(e => e.BatchId);
        builder.HasIndex(e => e.CheckDate);
        builder.HasIndex(e => e.IsExpired);
        builder.HasIndex(e => e.IsExpiringSoon);
    }
}
