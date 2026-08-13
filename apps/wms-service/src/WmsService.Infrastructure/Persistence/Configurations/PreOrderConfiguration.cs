using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class PreOrderConfiguration : IEntityTypeConfiguration<PreOrder>
{
    public void Configure(EntityTypeBuilder<PreOrder> builder)
    {
        builder.ToTable("pre_orders");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.CustomerReference).HasColumnName("customer_reference").HasMaxLength(200).IsRequired();
        builder.Property(e => e.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(e => e.RequestedDate).HasColumnName("requested_date").IsRequired();
        builder.Property(e => e.Status).HasColumnName("status").HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(e => e.Notes).HasColumnName("notes").HasMaxLength(1000);
        builder.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        builder.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId);
        builder.HasIndex(e => e.Status);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
