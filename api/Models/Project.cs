namespace NevaBook.Api.Models;

public sealed class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PublicCode { get; set; } = $"NBP-{DateTime.UtcNow:yyyyMMdd}-{Random.Shared.Next(1000, 9999)}";
    public string Title { get; set; } = "Моя фотокнига";
    public string Format { get; set; } = "20x20";
    public string CoverType { get; set; } = "photo";
    public string Status { get; set; } = "draft";
    public string LayoutJson { get; set; } = "{}";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Order> Orders { get; set; } = [];
}
