namespace NevaBook.Api.Models;

public sealed class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Number { get; set; } = $"NB-{DateTime.UtcNow:yyMMdd}-{Random.Shared.Next(1000, 9999)}";
    public Guid ProjectId { get; set; }
    public Project? Project { get; set; }
    public string CustomerName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Status { get; set; } = "new";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
