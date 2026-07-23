namespace backend.Models.Entities;

public class PlayerCounter
{
    public Guid Id { get; set; }
    
    public Guid PlayerId { get; set; }
    public Player Player { get; set; } = null!;

    public string CounterType { get; set; } = string.Empty;
    public int Value { get; set; }
}
