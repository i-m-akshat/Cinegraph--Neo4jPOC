using Neo4j.Driver;
using Neo4JPOC.Models;
using Neo4JPOC.Repository;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// ── Neo4j settings ────────────────────────────────────────────────
builder.Services.Configure<Neo4jSetup>(builder.Configuration.GetSection("Neo4jSettings"));

var neo4jSettings = new Neo4jSetup();
builder.Configuration.GetSection("Neo4jSettings").Bind(neo4jSettings);

builder.Services.AddSingleton(
    GraphDatabase.Driver(
        neo4jSettings.Neo4jConnection,
        AuthTokens.Basic(neo4jSettings.Neo4jUser, neo4jSettings.Neo4jPassword)
    )
);

// ── App services ──────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddScoped<Repo>();

// ── Swagger ───────────────────────────────────────────────────────
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "CineGraph API",
        Version = "v1",
        Description = "Neo4j movie graph database — CRUD operations and relationship management",
        Contact = new OpenApiContact
        {
            Name = "CineGraph",
            Url = new Uri("http://localhost:3000")
        },
        License = new OpenApiLicense
        {
            Name = "MIT",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        options.IncludeXmlComments(xmlPath);
});

// ── CORS ──────────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "http://localhost:5173",
                "http://localhost:4173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// ── Middleware pipeline ───────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "CineGraph API v1");
    options.RoutePrefix = "swagger";
    options.DefaultModelsExpandDepth(2);
    options.DefaultModelExpandDepth(2);
});

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();
