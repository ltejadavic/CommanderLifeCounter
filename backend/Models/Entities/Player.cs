namespace backend.Models.Entities;

public class Player
{
    public Guid Id { get; set; }
    public Guid GameId { get; set; }
    public Game Game { get; set; } = null!;
    
    public string Name { get; set; } = string.Empty;
    public int Life { get; set; }
    public string ColorAccent { get; set; } = string.Empty;
    public bool IsDefeated { get; set; }
    
    public string? CommanderName { get; set; }
    public string? CommanderImageUrl { get; set; }
    public string? CommanderArtCropUrl { get; set; }
    
    public bool IsMonarch { get; set; }

    public ICollection<CommanderDamage> CommanderDamages { get; set; } = new List<CommanderDamage>();
    public ICollection<PlayerCounter> Counters { get; set; } = new List<PlayerCounter>();
}
