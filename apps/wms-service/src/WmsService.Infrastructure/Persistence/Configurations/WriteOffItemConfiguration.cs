using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class WriteOffItemConfiguration : IEntityTypeConfiguration<WriteOffItem>
{
    public void Configure(EntityTypeBuilder<WriteOffItem> builder)
    {
        builder.ToTable("write_off_items");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();

        builder.Property(i => i.WriteOffId).HasColumnName("write_off_id").IsRequired();
        builder.Property(i => i.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(i => i.BatchId).HasColumnName("batch_id").IsRequired();
        builder.Property(i => i.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(i => i.Reason).HasColumnName("reason").HasMaxLength(500);
        builder.Property(i => i.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(i => i.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(i => i.WriteOff).WithMany(w => w.Items).HasForeignKey(i => i.WriteOffId);
        builder.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId);
        builder.HasOne(i => i.Batch).WithMany().HasForeignKey(i => i.BatchId);

        builder.HasIndex(i => i.WriteOffId);
        builder.HasIndex(i => i.BatchId);
    }
}
