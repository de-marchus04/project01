using Microsoft.EntityFrameworkCore;
using Yoga.Core.Entities;

namespace Yoga.Infrastructure.Data;

public class YogaDbContext : DbContext
{
    public YogaDbContext(DbContextOptions<YogaDbContext> options) : base(options)
    {
    }

    public DbSet<Tour> Tours { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<Course> Courses { get; set; }
    public DbSet<Consultation> Consultations { get; set; }
    public DbSet<Order> Orders { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Lesson> Lessons { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // Ensure property configurations if needed
        modelBuilder.Entity<Tour>().Property(t => t.Price).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Course>().Property(c => c.Price).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<Consultation>().Property(c => c.Price).HasColumnType("decimal(18,2)");
    }
}
