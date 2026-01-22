/// @file Program.cs
/// @brief Główny punkt wejścia aplikacji TechStore, odpowiedzialny za konfigurację usług i potoku HTTP.
/// @details Plik ten zawiera definicję kontenera wstrzykiwania zależności (Dependency Injection),
/// konfigurację systemów bezpieczeństwa (CORS, Identity, JWT), rejestrację usług biznesowych
/// oraz ustawienia middleware sterującego przepływem żądań.

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.Services;
using Sklep_internetowy.Server.Services.Auth;
using Sklep_internetowy.Server.Services.Bidding;
using Sklep_internetowy.Server.Services.Promotion;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// --- KONFIGURACJA USŁUG (Dependency Injection) ---

/**
 * @section CORS
 * Konfiguracja polityki Cross-Origin Resource Sharing (CORS).
 * @note MUSI być zarejestrowana przed innymi usługami, aby umożliwić komunikację z frontendem React.
 */
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:5174",
                "https://localhost:5174",
                "http://localhost:5084",
                "https://localhost:5084"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

/**
 * @section Database
 * Rejestracja kontekstu bazy danych PostgreSQL (Entity Framework Core).
 */
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<StoreDbContext>(options =>
    options.UseNpgsql(connectionString)
);

/**
 * @section BusinessServices
 * Rejestracja usług logicznych i pomocniczych aplikacji.
 */
builder.Services.AddScoped<AuctionService>();
builder.Services.AddHostedService<AuctionBackgroundService>();
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<PromotionService>();
builder.Services.Configure<MailSettings>(builder.Configuration.GetSection("MailSettings"));
builder.Services.AddTransient<EmailService>();
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("AuthSettings"));

/**
 * @section Controllers
 * Konfiguracja kontrolerów API z obsługą cykli w serializacji JSON.
 */
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.WriteIndented = true;
    });

/**
 * @section Identity
 * Konfiguracja systemu ASP.NET Core Identity dla autoryzacji opartej na użytkownikach i rolach.
 */
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<StoreDbContext>()
.AddDefaultTokenProviders()
.AddRoles<IdentityRole>();

/**
 * @section Authentication
 * Konfiguracja uwierzytelniania opartego na tokenach JWT oraz obsługa protokołu SignalR.
 */
var secretKey = builder.Configuration.GetValue<string>("AuthSettings:Key") ??
                builder.Configuration.GetValue<string>("AuthSettings:SecretKey");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero
    };

    // POPRAWKA: Konfiguracja dla SignalR - token z query string
    options.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;

            if (!string.IsNullOrEmpty(accessToken) &&
                path.StartsWithSegments("/auctionHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

/**
 * @section SignalR
 * Rejestracja usług czasu rzeczywistego (WebSockets).
 */
builder.Services.AddSignalR()
    .AddHubOptions<AuctionHub>(options =>
    {
        options.EnableDetailedErrors = true;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Wprowadź sam token JWT (bez słowa Bearer)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] { }
        }
    });
});

var app = builder.Build();

// --- KONFIGURACJA POTOKU PRZETWARZANIA (Middleware) ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// WAŻNE: CORS musi być przed Authentication/Authorization
app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

// WAŻNE: MapHub PRZED MapControllers
app.MapHub<AuctionHub>("/auctionHub");
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();