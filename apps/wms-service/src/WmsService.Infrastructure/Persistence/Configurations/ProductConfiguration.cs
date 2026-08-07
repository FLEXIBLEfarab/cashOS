using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("products");

        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).ValueGeneratedNever();

        builder.Property(p => p.ExternalId).HasColumnName("external_id").IsRequired();
        builder.Property(p => p.Name).HasColumnName("name").HasMaxLength(300).IsRequired();
        builder.Property(p => p.Barcode).HasColumnName("barcode").HasMaxLength(100).IsRequired();
        builder.Property(p => p.UnitOfMeasure).HasColumnName("unit_of_measure").HasMaxLength(50).IsRequired();
        builder.Property(p => p.Category).HasColumnName("category").HasMaxLength(100).IsRequired();
        builder.Property(p => p.IsActive).HasColumnName("is_active").IsRequired();
        builder.Property(p => p.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(p => p.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasIndex(p => p.ExternalId);
        builder.HasIndex(p => p.Barcode);
        builder.HasIndex(p => p.IsActive);
    }
}
