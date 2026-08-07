using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence.Configurations;

public sealed class ReceivingDocumentConfiguration : IEntityTypeConfiguration<ReceivingDocument>
{
    public void Configure(EntityTypeBuilder<ReceivingDocument> builder)
    {
        builder.ToTable("receiving_documents");

        builder.HasKey(r => r.Id);
        builder.Property(r => r.Id).ValueGeneratedNever();

        builder.Property(r => r.DocumentNumber).HasColumnName("document_number").HasMaxLength(100).IsRequired();
        builder.Property(r => r.WarehouseId).HasColumnName("warehouse_id").IsRequired();
        builder.Property(r => r.SupplierId).HasColumnName("supplier_id");
        builder.Property(r => r.TotalAmount).HasColumnName("total_amount").HasPrecision(18, 2);
        builder.Property(r => r.Status).HasColumnName("status").IsRequired();
        builder.Property(r => r.ReceivedAt).HasColumnName("received_at").IsRequired();
        builder.Property(r => r.CreatedBy).HasColumnName("created_by").HasMaxLength(100).IsRequired();
        builder.Property(r => r.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(r => r.UpdatedAt).HasColumnName("updated_at").IsRequired();

        builder.HasOne(r => r.Warehouse).WithMany().HasForeignKey(r => r.WarehouseId);
        builder.HasOne(r => r.Supplier).WithMany(s => s.ReceivingDocuments).HasForeignKey(r => r.SupplierId);

        builder.HasIndex(r => r.DocumentNumber).IsUnique();
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.WarehouseId);
    }
}
