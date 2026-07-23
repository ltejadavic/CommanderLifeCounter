namespace backend.Models.Entities;

public class CommanderDamage
{
    public Guid Id { get; set; }
    
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public Guid OpponentId { get; set; }
    
    public int Damage { get; set; }
}
