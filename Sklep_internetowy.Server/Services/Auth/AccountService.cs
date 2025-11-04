using Microsoft.AspNetCore.Identity;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;

namespace Sklep_internetowy.Server.Services.Auth
{
    public class AccountService
    {
        private readonly StoreDbContext _context;
        private readonly JwtService _jwtService;
        public void Register(string username, string email, string password)
        {
            var user = new User
            {
                Id = Guid.NewGuid(),
                Email = email,
                UserName = username
            };

            var HashedPassword = new PasswordHasher<User>().HashPassword(user, password);
            user.PasswordHash = HashedPassword;
            _context.AddAsync(user);
        }

        public string Login(string username, string password)
        {
            var user = _context.Users.FirstOrDefault(a => a.UserName == username);

            var result = new PasswordHasher<User>()
                .VerifyHashedPassword(user, user.PasswordHash, password);

            if (result == PasswordVerificationResult.Success)
            {
                return _jwtService.GenerateToken(user);
            }
            else
            {
                throw new Exception("Nie załogowałeś się!");
            }
        }
    }
}
