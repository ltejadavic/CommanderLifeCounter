using Microsoft.EntityFrameworkCore;
using backend.Services;
using backend.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();
builder.Services.AddHttpClient<IScryfallService, ScryfallService>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Host=localhost;Port=5434;Database=commandercounter;Username=myuser;Password=mypassword";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// CORS policy for frontend
var frontendUrl = builder.Configuration.GetValue<string>("FrontendUrl");
var allowedOrigins = new List<string> { "http://localhost:5173", "http://localhost", "http://127.0.0.1" };
if (!string.IsNullOrEmpty(frontendUrl))
{
    allowedOrigins.Add(frontendUrl);
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy =>
        {
            policy.WithOrigins(allowedOrigins.ToArray())
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowFrontend");
app.MapControllers();

// Apply automatic migrations on startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
}

app.Run();
