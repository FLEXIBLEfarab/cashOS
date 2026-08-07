using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class InventoryItemConfiguration : IEntityTypeConfiguration<InventoryItem>
{
    public void Configure(EntityTypeBuilder<InventoryItem> builder)
    {
        builder.ToTable("inventory_items");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();

        builder.Property(i => i.InventoryId).HasColumnName("inventory_id").IsRequired();
        builder.Property(i => i.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(i => i.BatchId).HasColumnName("batch_id");
        builder.Property(i => i.ExpectedQuantity).HasColumnName("expected_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(i => i.ActualQuantity).HasColumnName("actual_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(i => i.IsMatched).HasColumnName("is_matched").IsRequired();
        builder.Property(i => i.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(i => i.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(i => i.Inventory).WithMany(inv => inv.Items).HasForeignKey(i => i.InventoryId);
        builder.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId);
        builder.HasOne(i => i.Batch).WithMany().HasForeignKey(i => i.BatchId);

        builder.HasIndex(i => i.InventoryId);
        builder.HasIndex(i => i.ProductId);
    }
}
