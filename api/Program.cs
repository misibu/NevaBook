using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using NevaBook.Api.Data;
using NevaBook.Api.Models;
using NevaBook.Api.Services;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? builder.Configuration["DATABASE_URL"]
    ?? "Host=localhost;Port=5432;Database=nevabook;Username=nevabook;Password=nevabook";

builder.Services.AddDbContext<NevaBookDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddSingleton<ObjectStorageService>();
builder.Services.AddHttpClient("n8n");
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy
    .WithOrigins((builder.Configuration["CORS_ORIGINS"] ?? "http://localhost:3000").Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
    .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<NevaBookDbContext>();
    await db.Database.EnsureCreatedAsync();
}

app.MapGet("/health", () => Results.Ok(new { ok = true, service = "neva-book-api", utc = DateTime.UtcNow }));

app.MapGet("/api/projects/{id:guid}", async (Guid id, NevaBookDbContext db) =>
    await db.Projects.FindAsync(id) is { } project ? Results.Ok(project) : Results.NotFound());

app.MapPost("/api/projects", async (ProjectInput input, NevaBookDbContext db) =>
{
    var project = new Project { Title = input.Title, Format = input.Format, CoverType = input.CoverType, LayoutJson = input.LayoutJson ?? "{}" };
    db.Projects.Add(project);
    await db.SaveChangesAsync();
    return Results.Created($"/api/projects/{project.Id}", project);
});

app.MapPut("/api/projects/{id:guid}/layout", async (Guid id, LayoutInput input, NevaBookDbContext db) =>
{
    var project = await db.Projects.FindAsync(id);
    if (project is null) return Results.NotFound();
    project.LayoutJson = input.LayoutJson;
    project.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();
    return Results.Ok(project);
});

app.MapPost("/api/uploads/presign", async (UploadInput input, ObjectStorageService storage) =>
{
    if (!storage.IsConfigured) return Results.Problem("S3 is not configured yet.", statusCode: 503);
    var safeName = Path.GetFileName(input.FileName).Replace(" ", "-");
    var key = $"originals/{DateTime.UtcNow:yyyy/MM}/{Guid.NewGuid():N}-{safeName}";
    var url = await storage.CreateUploadUrl(key, input.ContentType);
    return Results.Ok(new { key, url });
});

app.MapPost("/api/orders", async (OrderInput input, NevaBookDbContext db, IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<Program> logger) =>
{
    var project = await db.Projects.FindAsync(input.ProjectId);
    if (project is null) return Results.BadRequest(new { error = "Unknown project" });

    var order = new Order { ProjectId = project.Id, CustomerName = input.CustomerName, Email = input.Email, Phone = input.Phone };
    project.Status = "ordered";
    project.UpdatedAt = DateTime.UtcNow;
    db.Orders.Add(order);
    await db.SaveChangesAsync();

    var webhook = configuration["N8N_NEW_ORDER_WEBHOOK_URL"];
    if (!string.IsNullOrWhiteSpace(webhook))
    {
        try
        {
            var payload = JsonContent.Create(new { order.Id, order.Number, order.CustomerName, order.Email, order.Phone, project.PublicCode, project.Format, project.CoverType });
            await httpClientFactory.CreateClient("n8n").PostAsync(webhook, payload);
        }
        catch (Exception ex) { logger.LogError(ex, "Order {OrderNumber} saved, but n8n notification failed", order.Number); }
    }

    return Results.Created($"/api/orders/{order.Id}", order);
});

app.Run();

record ProjectInput(string Title = "Моя фотокнига", string Format = "20x20", string CoverType = "photo", string? LayoutJson = null);
record LayoutInput(string LayoutJson);
record UploadInput(string FileName, string ContentType);
record OrderInput(Guid ProjectId, string CustomerName, string Email, string Phone);
