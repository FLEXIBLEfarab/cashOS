using MediatR;
using WmsService.Application.Common.Interfaces;
using WmsService.Domain.Entities;

namespace WmsService.Application.Features.Pricing.Commands;

public sealed record CreateSeasonalPriceListCommand : IRequest<Guid>
{
    public Guid ProductId { get; init; }
    public Guid? WarehouseId { get; init; }
    public string Name { get; init; } = string.Empty;
    public DateTime StartDate { get; init; }
    public DateTime EndDate { get; init; }
    public decimal Price { get; init; }
}

public sealed class CreateSeasonalPriceListCommandHandler : IRequestHandler<CreateSeasonalPriceListCommand, Guid>
{
    private readonly IRepository<SeasonalPriceList> _priceLists;
    private readonly IUnitOfWork _unitOfWork;

    public CreateSeasonalPriceListCommandHandler(IRepository<SeasonalPriceList> priceLists, IUnitOfWork unitOfWork)
    {
        _priceLists = priceLists;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateSeasonalPriceListCommand request, CancellationToken cancellationToken)
    {
        if (request.EndDate < request.StartDate)
        {
            throw new ArgumentException("EndDate не может быть раньше StartDate");
        }

        var priceList = new SeasonalPriceList
        {
            ProductId = request.ProductId,
            WarehouseId = request.WarehouseId,
            Name = request.Name,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Price = request.Price,
            IsActive = true
        };

        await _priceLists.AddAsync(priceList, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return priceList.Id;
    }
}
