using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class ReceivingDocumentItemConfiguration : IEntityTypeConfiguration<ReceivingDocumentItem>
{
    public void Configure(EntityTypeBuilder<ReceivingDocumentItem> builder)
    {
        builder.ToTable("receiving_document_items");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.Quantity).HasColumnName("quantity").HasPrecision(18, 3).IsRequired();
        builder.Property(e => e.Price).HasColumnName("price").HasPrecision(18, 2);
        builder.Property(e => e.BatchNumber).HasColumnName("batch_number").HasMaxLength(100);
        builder.HasOne(e => e.ReceivingDocument).WithMany(d => d.Items).HasForeignKey(e => e.ReceivingDocumentId);
        builder.HasOne(e => e.Product).WithMany().HasForeignKey(e => e.ProductId);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
