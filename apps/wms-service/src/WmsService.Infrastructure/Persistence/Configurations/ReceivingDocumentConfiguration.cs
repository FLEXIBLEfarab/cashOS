using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class ReceivingDocumentConfiguration : IEntityTypeConfiguration<ReceivingDocument>
{
    public void Configure(EntityTypeBuilder<ReceivingDocument> builder)
    {
        builder.ToTable("receiving_documents");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).ValueGeneratedNever();
        builder.Property(e => e.DocumentNumber).HasColumnName("document_number").HasMaxLength(100).IsRequired();
        builder.Property(e => e.DocumentDate).HasColumnName("document_date").IsRequired();
        builder.HasOne(e => e.Warehouse).WithMany().HasForeignKey(e => e.WarehouseId);
        builder.HasOne(e => e.Supplier).WithMany().HasForeignKey(e => e.SupplierId);
        builder.Property(e => e.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(e => e.UpdatedAt).HasColumnName("updated_at").IsRequired();
    }
}
