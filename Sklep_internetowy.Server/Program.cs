using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Npgsql.EntityFrameworkCore;
using Sklep_internetowy.Server.Services.Auth;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options => {
    options.AddPolicy("AllowFrontend", policy => {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddDbContext<StoreDbContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<AccountService>();
builder.Services.AddScoped<JwtService>();
builder.Services.Configure<AuthSettings>(builder.Configuration.GetSection("AuthSettings"));

builder.Services.AddAuth(builder.Configuration);
builder.Services.AddControllers();


builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
})
.AddEntityFrameworkStores<StoreDbContext>()
.AddDefaultTokenProviders();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();


app.UseCors("AllowFrontend");

app.UseDefaultFiles();
app.UseStaticFiles();

app.MapControllers();


if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseAuthentication();
app.UseCors("AllowReactApp");
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
