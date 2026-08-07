using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("warehouses");

        builder.HasKey(w => w.Id);
        builder.Property(w => w.Id).ValueGeneratedNever();

        builder.Property(w => w.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(w => w.Address).HasColumnName("address").HasMaxLength(500).IsRequired();
        builder.Property(w => w.IsActive).HasColumnName("is_active").IsRequired();
        builder.Property(w => w.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(w => w.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(w => w.IsActive);
        builder.HasIndex(w => w.Name);
    }
}
