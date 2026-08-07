using Microsoft.EntityFrameworkCore;
using WmsService.Application.Common.Interfaces;

namespace WmsService.Infrastructure.Persistence;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly WmsDbContext _context;
    private bool _disposed;

    public UnitOfWork(WmsDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return await _context.SaveChangesAsync(cancellationToken);
    }

    public void Dispose()
    {
        if (!_disposed)
        {
            _context.Dispose();
            _disposed = true;
        }
    }
}
