namespace backend.Models.Entities;

public class Game
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime LastUpdatedAt { get; set; }
    public bool IsArchenemy { get; set; }
    public ICollection<Player> Players { get; set; } = new List<Player>();
}
