namespace WmsService.Domain.Entities;

public enum MovementType { Receive, WriteOff, MoveIn, MoveOut, Reserve, Release }

public sealed class StockMovement : BaseEntity
{
    public Guid StockId { get; set; }
    public Stock Stock { get; set; } = null!;
    public Guid? BatchId { get; set; }
    public Batch? Batch { get; set; }
    public MovementType Type { get; set; }
    public decimal Quantity { get; set; }
    public string? Reason { get; set; }
    public Guid? SourceWarehouseId { get; set; }
    public Guid? TargetWarehouseId { get; set; }
    public string? PerformedByUserId { get; set; }
    public string? PerformedByUserName { get; set; }
}
