using Microsoft.EntityFrameworkCore;
using WmsService.Domain.Entities;

namespace WmsService.Infrastructure.Persistence;

public sealed class WmsDbContext : DbContext
{
    public WmsDbContext(DbContextOptions<WmsDbContext> options) : base(options) { }

    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Stock> Stocks => Set<Stock>();
    public DbSet<Batch> Batches => Set<Batch>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<ReceivingDocument> ReceivingDocuments => Set<ReceivingDocument>();
    public DbSet<ReceivingDocumentItem> ReceivingDocumentItems => Set<ReceivingDocumentItem>();
    public DbSet<WriteOff> WriteOffs => Set<WriteOff>();
    public DbSet<WriteOffItem> WriteOffItems => Set<WriteOffItem>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<ExpirationCheckLog> ExpirationCheckLogs => Set<ExpirationCheckLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(WmsDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
