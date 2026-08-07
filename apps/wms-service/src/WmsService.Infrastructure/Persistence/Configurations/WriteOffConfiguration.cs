using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class WriteOffConfiguration : IEntityTypeConfiguration<WriteOff>
{
    public void Configure(EntityTypeBuilder<WriteOff> builder)
    {
        builder.ToTable("write_offs");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).ValueGeneratedNever();

        builder.Property(w => w.DocumentNumber).HasColumnName("document_number").HasMaxLength(100).IsRequired();
        builder.Property(w => w.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(w => w.Reason).HasColumnName("reason").IsRequired();
        builder.Property(w => w.Status).HasColumnName("status").IsRequired();
        builder.Property(w => w.TotalQuantity).HasColumnName("total_quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(w => w.CreatedBy).HasColumnName("created_by").HasMaxLength(100).IsRequired();
        builder.Property(w => w.ApprovedBy).HasColumnName("approved_by").HasMaxLength(100);
        builder.Property(w => w.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(w => w.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(w => w.Warehouse).WithMany().HasForeignKey(w => w.WarehouseId);

        builder.HasIndex(w => w.DocumentNumber).IsUnique();
        builder.HasIndex(w => w.Status);
        builder.HasIndex(w => w.WarehouseId);
    }
}
