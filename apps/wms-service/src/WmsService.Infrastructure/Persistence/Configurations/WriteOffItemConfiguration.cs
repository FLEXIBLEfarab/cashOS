using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class WriteOffItemConfiguration : IEntityTypeConfiguration<WriteOffItem>
{
    public void Configure(EntityTypeBuilder<WriteOffItem> builder)
    {
        builder.ToTable("write_off_items");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(e => e.Reason).HasColumnName("reason").HasMaxLength(500);
        builder.HasOne(e => e.WriteOff).WithMany(w => w.Items).HasForeignKey(e => e.WriteOffId);
        builder.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        builder.HasOne(e => e.Batch).WithMany().HasForeignKey(e => e.BatchId);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
