using Microsoft.EntityFrameworkCore;
using backend.Models.Entities;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Game> Games { get; set; } = null!;
    public DbSet<Player> Players { get; set; } = null!;
    public DbSet<CommanderDamage> CommanderDamages { get; set; } = null!;
    public DbSet<PlayerCounter> PlayerCounters { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure cascade deletes
        modelBuilder.Entity<Game>()
            .HasMany(g => g.Players)
            .WithOne(p => p.Game)
            .HasForeignKey(p => p.GameId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Player>()
            .HasMany(p => p.CommanderDamages)
            .WithOne(c => c.Player)
            .HasForeignKey(c => c.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Player>()
            .HasMany(p => p.Counters)
            .WithOne(c => c.Player)
            .HasForeignKey(c => c.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
