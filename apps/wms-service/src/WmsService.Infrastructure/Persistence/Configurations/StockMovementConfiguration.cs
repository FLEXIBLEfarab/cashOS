using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class StockMovementConfiguration : IEntityTypeConfiguration<StockMovement>
{
    public void Configure(EntityTypeBuilder<StockMovement> builder)
    {
        builder.ToTable("stock_movements");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.Type).HasColumnName("type").HasConversion<string>().HasMaxLength(50).IsRequired();
        builder.Property(e => e.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(e => e.Reason).HasColumnName("reason").HasMaxLength(500);
        builder.HasOne(e => e.Stock).WithMany(s => s.StockMovements).HasForeignKey(e => e.StockId);
        builder.HasOne(e => e.Batch).WithMany(b => b.StockMovements).HasForeignKey(e => e.BatchId);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
