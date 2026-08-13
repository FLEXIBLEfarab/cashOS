using FluentValidation;
using WmsService.Application.DTOs;

namespace WmsService.Application.Validators;

public sealed class ReceiveStockRequestValidator : AbstractValidator<ReceiveStockRequest>
{
    public ReceiveStockRequestValidator()
    {
        RuleFor(x => x.WarehouseId).NotEmpty();
        RuleFor(x => x.DocumentNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.CreatedBy).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Items).NotEmpty().Must(items => items.Count > 0).WithMessage("At least one item is required");

        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.ProductId).NotEmpty();
            item.RuleFor(x => x.Quantity).GreaterThan(0);
        });
    }
}
