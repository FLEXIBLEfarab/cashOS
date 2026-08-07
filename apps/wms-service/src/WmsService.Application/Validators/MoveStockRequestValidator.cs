using FluentValidation;
using WmsService.Application.DTOs;

namespace WmsService.Application.Validators;

public sealed class MoveStockRequestValidator : AbstractValidator<MoveStockRequest>
{
    public MoveStockRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.SourceWarehouseId).NotEmpty();
        RuleFor(x => x.DestinationWarehouseId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.DocumentNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PerformedBy).NotEmpty().MaximumLength(100);
        RuleFor(x => x.SourceWarehouseId)
            .NotEqual(x => x.DestinationWarehouseId)
            .WithMessage("Source and destination warehouses must be different");
    }
}
