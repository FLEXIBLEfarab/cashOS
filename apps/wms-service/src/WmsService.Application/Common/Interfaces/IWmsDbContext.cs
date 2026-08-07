using Microsoft.EntityFrameworkCore;
using WmsService.Domain.Entities;

namespace WmsService.Application.Common.Interfaces;

public interface IWmsDbContext
{
    DbSet<Warehouse> Warehouses { get; }
    DbSet<Product> Products { get; }
    DbSet<Stock> Stocks { get; }
    DbSet<Batch> Batches { get; }
    DbSet<StockMovement> StockMovements { get; }
    DbSet<ReceivingDocument> ReceivingDocuments { get; }
    DbSet<ReceivingDocumentItem> ReceivingDocumentItems { get; }
    DbSet<WriteOff> WriteOffs { get; }
    DbSet<WriteOffItem> WriteOffItems { get; }
    DbSet<Inventory> Inventories { get; }
    DbSet<InventoryItem> InventoryItems { get; }
    DbSet<Supplier> Suppliers { get; }
    DbSet<ExpirationCheckLog> ExpirationCheckLogs { get; }
}
