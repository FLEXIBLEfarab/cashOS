using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class StockConfiguration : IEntityTypeConfiguration<Stock>
{
    public void Configure(EntityTypeBuilder<Stock> builder)
    {
        builder.ToTable("stocks");

        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).ValueGeneratedNever();

        builder.Property(s => s.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(s => s.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(s => s.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(s => s.ReservedQuantity).HasColumnName("reserved_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(s => s.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(s => s.Product).WithMany(p => p.Stocks).HasForeignKey(s => s.ProductId);
        builder.HasOne(s => s.Warehouse).WithMany(w => w.Stocks).HasForeignKey(s => s.WarehouseId);

        builder.HasIndex(s => new { s.ProductId, s.WarehouseId }).IsUnique();
        builder.HasIndex(s => s.WarehouseId);
    }
}
