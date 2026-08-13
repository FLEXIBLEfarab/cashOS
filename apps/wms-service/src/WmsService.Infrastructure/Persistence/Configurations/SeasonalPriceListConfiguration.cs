using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class SeasonalPriceListConfiguration : IEntityTypeConfiguration<SeasonalPriceList>
{
    public void Configure(EntityTypeBuilder<SeasonalPriceList> builder)
    {
        builder.ToTable("seasonal_price_lists");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
        builder.Property(e => e.StartDate).HasColumnName("start_date").IsRequired();
        builder.Property(e => e.EndDate).HasColumnName("end_date").IsRequired();
        builder.Property(e => e.Price).HasColumnName("price").HasPrecision(18, 2).IsRequired();
        builder.Property(e => e.IsActive).HasColumnName("is_active").IsRequired();
        builder.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        builder.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId);
        builder.HasIndex(e => new { e.ProductId, e.StartDate, e.EndDate });
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
