using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Services;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScryfallController : ControllerBase
{
    private readonly IScryfallService _scryfallService;

    public ScryfallController(IScryfallService scryfallService)
    {
        _scryfallService = scryfallService;
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<CommanderDto>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return BadRequest("Query parameter 'q' is required.");
        }

        var results = await _scryfallService.SearchCommandersAsync(q);
        return Ok(results);
    }
}
