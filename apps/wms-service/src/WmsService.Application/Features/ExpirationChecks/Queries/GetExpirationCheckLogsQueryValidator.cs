using FluentValidation;

namespace WmsService.Application.Features.ExpirationChecks.Queries;

public sealed class GetExpirationCheckLogsQueryValidator : AbstractValidator<GetExpirationCheckLogsQuery>
{
    public GetExpirationCheckLogsQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}
