using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class ReceivingDocumentItemConfiguration : IEntityTypeConfiguration<ReceivingDocumentItem>
{
    public void Configure(EntityTypeBuilder<ReceivingDocumentItem> builder)
    {
        builder.ToTable("receiving_document_items");

        builder.HasKey(i => i.Id);
        builder.Property(i => i.Id).ValueGeneratedNever();

        builder.Property(i => i.ReceivingDocumentId).HasColumnName("receiving_document_id").IsRequired();
        builder.Property(i => i.ProductId).HasColumnName("product_id").IsRequired();
        builder.Property(i => i.BatchId).HasColumnName("batch_id");
        builder.Property(i => i.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(i => i.UnitPrice).HasColumnName("unit_price").HasPrecision(18, 2);
        builder.Property(i => i.ExpirationDate).HasColumnName("expiration_date");
        builder.Property(i => i.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(i => i.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(i => i.ReceivingDocument).WithMany(r => r.Items).HasForeignKey(i => i.ReceivingDocumentId);
        builder.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId);
        builder.HasOne(i => i.Batch).WithMany().HasForeignKey(i => i.BatchId);

        builder.HasIndex(i => i.ReceivingDocumentId);
        builder.HasIndex(i => i.ProductId);
    }
}
