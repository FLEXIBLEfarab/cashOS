using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.ToTable("inventories");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();

        builder.Property(i => i.DocumentNumber).HasColumnName("document_number").HasMaxLength(100).IsRequired();
        builder.Property(i => i.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(i => i.Status).HasColumnName("status").IsRequired();
        builder.Property(i => i.StartedAt).HasColumnName("started_at");
        builder.Property(i => i.CompletedAt).HasColumnName("completed_at");
        builder.Property(i => i.CreatedBy).HasColumnName("created_by").HasMaxLength(100).IsRequired();
        builder.Property(i => i.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(i => i.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(i => i.Warehouse).WithMany().HasForeignKey(i => i.WarehouseId);

        builder.HasIndex(i => i.DocumentNumber).IsUnique();
        builder.HasIndex(i => i.Status);
        builder.HasIndex(i => i.WarehouseId);
    }
}
