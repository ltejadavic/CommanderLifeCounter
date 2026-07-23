using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Caching.Memory;
using backend.Models;

namespace backend.Services;

public interface IScryfallService
{
    Task<List<CommanderDto>> SearchCommandersAsync(string query);
}

public class ScryfallService : IScryfallService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private readonly ILogger<ScryfallService> _logger;

    public ScryfallService(HttpClient httpClient, IMemoryCache cache, ILogger<ScryfallService> logger)
    {
        _httpClient = httpClient;
        _cache = cache;
        _logger = logger;
        
        _httpClient.BaseAddress = new Uri("https://api.scryfall.com/");
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "CommanderCounter/1.0");
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    public async Task<List<CommanderDto>> SearchCommandersAsync(string query)
    {
        if (string.IsNullOrWhiteSpace(query)) return new List<CommanderDto>();

        var cacheKey = $"scryfall_search_{query.ToLowerInvariant()}";

        if (_cache.TryGetValue(cacheKey, out List<CommanderDto>? cachedResult))
        {
            _logger.LogInformation("Scryfall cache hit for query: {Query}", query);
            return cachedResult ?? new List<CommanderDto>();
        }

        try
        {
            _logger.LogInformation("Querying Scryfall for: {Query}", query);
            
            // Search for legendary creatures. We append 'is:commander' implicitly if they are searching for a commander.
            // But usually just legendary creature is fine. We'll use: `q={query} is:commander`
            var encodedQuery = Uri.EscapeDataString($"{query} is:commander");
            var response = await _httpClient.GetAsync($"cards/search?q={encodedQuery}");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Scryfall API returned {StatusCode} for query {Query}", response.StatusCode, query);
                return new List<CommanderDto>();
            }

            var jsonStream = await response.Content.ReadAsStreamAsync();
            var searchResponse = await JsonSerializer.DeserializeAsync<ScryfallSearchResponse>(jsonStream, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (searchResponse?.Data == null) return new List<CommanderDto>();

            var dtos = searchResponse.Data.Select(c => new CommanderDto
            {
                ScryfallId = c.Id,
                Name = c.Name,
                ImageUrl = c.Image_Uris?.Normal ?? "",
                ArtCropUrl = c.Image_Uris?.Art_Crop ?? "",
                ManaCost = c.Mana_Cost ?? "",
                TypeLine = c.Type_Line ?? "",
                OracleText = c.Oracle_Text ?? ""
            }).ToList();

            var cacheEntryOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));

            _cache.Set(cacheKey, dtos, cacheEntryOptions);

            return dtos;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while searching Scryfall for query: {Query}", query);
            return new List<CommanderDto>();
        }
    }

    private class ScryfallSearchResponse
    {
        public List<ScryfallCard>? Data { get; set; }
    }

    private class ScryfallCard
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ScryfallImageUris? Image_Uris { get; set; }
        public string? Mana_Cost { get; set; }
        public string? Type_Line { get; set; }
        public string? Oracle_Text { get; set; }
    }

    private class ScryfallImageUris
    {
        public string? Normal { get; set; }
        public string? Art_Crop { get; set; }
    }
}
