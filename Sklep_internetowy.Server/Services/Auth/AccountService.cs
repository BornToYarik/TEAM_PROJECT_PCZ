using Microsoft.AspNetCore.Identity;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.DTOs;

namespace Sklep_internetowy.Server.Services.Auth
{
    public class AccountService
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly StoreDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IConfiguration _config;
        private readonly ILogger _logger;

        public AccountService(UserManager<User> userManager,
            RoleManager<IdentityRole> roleManager,
            JwtService jwtService,
            IConfiguration config, ILogger<AccountService> logger)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _jwtService = jwtService;
            _config = config;
            _logger = logger;
        }

        public async Task Register(string username, string email, string password)
        {
            if (!await _roleManager.RoleExistsAsync("Admin"))
                await _roleManager.CreateAsync(new IdentityRole("Admin"));

            if (!await _roleManager.RoleExistsAsync("User"))
                await _roleManager.CreateAsync(new IdentityRole("User"));

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

            var usersCount = _userManager.Users.Count();
            if (usersCount <= 1)
            {
                await _userManager.AddToRoleAsync(account, "Admin");
            }
            else
            {
                await _userManager.AddToRoleAsync(account, "User");
            }
        }

        public async Task<(string Token, User User)> Login(string username, string password)
        {
            var account = await _userManager.FindByNameAsync(username);
            if (account == null)
                throw new Exception("Invalid user");

            var result = await _userManager.CheckPasswordAsync(account, password);
            if (!result)
                throw new Exception("Wrong password");

            var token = await _jwtService.GenerateToken(account);

            return (token, account);
        }

        public async Task<User> GetUserByNameAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            return user;
        }

        public async Task UpdateUserAsync(string currentUsername, UpdateUserRequest request)
        {
            var user = await _userManager.FindByNameAsync(currentUsername);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            user.UserName = request.UserName;
            user.Email = request.Email;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Update failed: {errors}");
            }
        }
    }
}