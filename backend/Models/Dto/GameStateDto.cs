namespace backend.Models.Dto;

public class GameStateDto
{
    public string Id { get; set; } = string.Empty;
    public bool IsArchenemy { get; set; }
    public List<PlayerDto> Players { get; set; } = new List<PlayerDto>();
}

public class PlayerDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int Life { get; set; }
    public string ColorAccent { get; set; } = string.Empty;
    public bool IsDefeated { get; set; }
    
    public string? CommanderName { get; set; }
    public string? CommanderImageUrl { get; set; }
    public string? CommanderArtCropUrl { get; set; }
    public int CommanderOpacity { get; set; } = 50;
    
    public bool IsMonarch { get; set; }
    
    public Dictionary<string, int> CommanderDamage { get; set; } = new Dictionary<string, int>();
    public Dictionary<string, int> Counters { get; set; } = new Dictionary<string, int>();
}
