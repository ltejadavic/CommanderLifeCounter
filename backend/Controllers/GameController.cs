using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models.Entities;
using backend.Models.Dto;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController : ControllerBase
{
    private readonly AppDbContext _context;

    public GameController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<GameStateDto>> GetGame(Guid id)
    {
        var game = await _context.Games
            .Include(g => g.Players)
                .ThenInclude(p => p.CommanderDamages)
            .Include(g => g.Players)
                .ThenInclude(p => p.Counters)
            .FirstOrDefaultAsync(g => g.Id == id);

        if (game == null)
            return NotFound();

        var dto = new GameStateDto
        {
            Id = game.Id.ToString(),
            IsArchenemy = game.IsArchenemy,
            Players = game.Players.Select(p => new PlayerDto
            {
                Id = p.Id.ToString(),
                Name = p.Name,
                Life = p.Life,
                ColorAccent = p.ColorAccent,
                IsDefeated = p.IsDefeated,
                IsMonarch = p.IsMonarch,
                CommanderName = p.CommanderName,
                CommanderImageUrl = p.CommanderImageUrl,
                CommanderArtCropUrl = p.CommanderArtCropUrl,
                CommanderDamage = p.CommanderDamages.ToDictionary(cd => cd.OpponentId.ToString(), cd => cd.Damage),
                Counters = p.Counters.ToDictionary(c => c.CounterType, c => c.Value)
            }).ToList()
        };

        return Ok(dto);
    }

    [HttpPost]
    public async Task<ActionResult> SaveGame([FromBody] GameStateDto dto)
    {
        if (!Guid.TryParse(dto.Id, out var gameId))
            return BadRequest("Invalid Game ID");

        var existingGame = await _context.Games
            .Include(g => g.Players)
                .ThenInclude(p => p.CommanderDamages)
            .Include(g => g.Players)
                .ThenInclude(p => p.Counters)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (existingGame != null)
        {
            _context.Games.Remove(existingGame);
            await _context.SaveChangesAsync();
        }

        var newGame = new Game
        {
            Id = gameId,
            CreatedAt = existingGame?.CreatedAt ?? DateTime.UtcNow,
            LastUpdatedAt = DateTime.UtcNow,
            IsArchenemy = dto.IsArchenemy,
            Players = dto.Players.Select(p => new Player
            {
                Id = Guid.Parse(p.Id),
                Name = p.Name,
                Life = p.Life,
                ColorAccent = p.ColorAccent,
                IsDefeated = p.IsDefeated,
                IsMonarch = p.IsMonarch,
                CommanderName = p.CommanderName,
                CommanderImageUrl = p.CommanderImageUrl,
                CommanderArtCropUrl = p.CommanderArtCropUrl,
                CommanderDamages = p.CommanderDamage.Select(kv => new CommanderDamage
                {
                    Id = Guid.NewGuid(),
                    OpponentId = Guid.Parse(kv.Key),
                    Damage = kv.Value
                }).ToList(),
                Counters = p.Counters.Select(kv => new PlayerCounter
                {
                    Id = Guid.NewGuid(),
                    CounterType = kv.Key,
                    Value = kv.Value
                }).ToList()
            }).ToList()
        };

        _context.Games.Add(newGame);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
