using Microsoft.EntityFrameworkCore;
using NevaBook.Api.Models;

namespace NevaBook.Api.Data;

public sealed class NevaBookDbContext(DbContextOptions<NevaBookDbContext> options) : DbContext(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.PublicCode).IsUnique();
            entity.Property(x => x.LayoutJson).HasColumnType("jsonb");
        });
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(x => x.Id);
            entity.HasIndex(x => x.Number).IsUnique();
            entity.HasOne(x => x.Project).WithMany(x => x.Orders).HasForeignKey(x => x.ProjectId);
        });
    }
}
