using Microsoft.AspNetCore.Identity;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;

namespace Sklep_internetowy.Server.Services.Auth
{
    public class AccountService
    {
        private readonly UserManager<User> _userManager;
        private readonly StoreDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IConfiguration _config;
        private readonly ILogger _logger;
        public AccountService(UserManager<User> userManager, JwtService jwtService,
           IConfiguration config, ILogger<AccountService> logger)
        {
            _userManager = userManager;
            _jwtService = jwtService;
            _config = config;
            _logger = logger;
        }
        public async Task Register(string username, string email, string password)
        {
            var account = new User
            {
                UserName = username,
                Email = email
            };

            var result = await _userManager.CreateAsync(account, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Nie udało się zarejestrować użytkownika: {errors}");
            }
        }

        public async Task<string> Login(string username, string password)
        {
            var account = await _userManager.FindByNameAsync(username);
            if (account == null)
                throw new Exception("Nie znaleziono użytkownika");

            var result = await _userManager.CheckPasswordAsync(account, password);
            if (!result)
                throw new Exception("Niepoprawne hasło");

            return _jwtService.GenerateToken(account);
        }
    }
}
