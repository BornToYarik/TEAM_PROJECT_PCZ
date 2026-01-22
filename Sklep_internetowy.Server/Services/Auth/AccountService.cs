using Microsoft.AspNetCore.Identity;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.DTOs;

namespace Sklep_internetowy.Server.Services.Auth
{
    /**
     * @class AccountService
     * @brief Serwis odpowiedzialny za obsługę kont użytkowników.
     * @details Realizuje rejestrację, logowanie, pobieranie oraz aktualizację danych użytkownika.
     */
    public class AccountService
    {
        /** @brief Menedżer użytkowników ASP.NET Identity */
        private readonly UserManager<User> _userManager;

        /** @brief Menedżer ról ASP.NET Identity */
        private readonly RoleManager<IdentityRole> _roleManager;

        /** @brief Kontekst bazy danych */
        private readonly StoreDbContext _context;

        /** @brief Serwis generowania tokenów JWT */
        private readonly JwtService _jwtService;

        /** @brief Konfiguracja aplikacji */
        private readonly IConfiguration _config;

        /** @brief Logger serwisu */
        private readonly ILogger _logger;

        /**
         * @brief Konstruktor serwisu AccountService.
         * @param userManager Menedżer użytkowników.
         * @param roleManager Menedżer ról.
         * @param jwtService Serwis JWT.
         * @param config Konfiguracja aplikacji.
         * @param logger Logger.
         */
        public AccountService(
            UserManager<User> userManager,
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

        /**
         * @brief Rejestruje nowego użytkownika w systemie.
         * @details Tworzy role Admin i User jeśli nie istnieją. Pierwszy użytkownik dostaje rolę Admin.
         * @param username Nazwa użytkownika.
         * @param email Adres e-mail.
         * @param password Hasło.
         * @throws Exception Gdy rejestracja się nie powiedzie.
         */
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

        /**
         * @brief Loguje użytkownika do systemu.
         * @param username Nazwa użytkownika.
         * @param password Hasło.
         * @return Krotka zawierająca token JWT oraz obiekt użytkownika.
         * @throws Exception Gdy użytkownik nie istnieje lub hasło jest błędne.
         */
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

        /**
         * @brief Pobiera użytkownika po nazwie.
         * @param username Nazwa użytkownika.
         * @return Obiekt użytkownika lub null jeśli nie istnieje.
         */
        public async Task<User> GetUserByNameAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            return user;
        }

        /**
         * @brief Aktualizuje dane użytkownika.
         * @param currentUsername Aktualna nazwa użytkownika.
         * @param request Obiekt DTO z nowymi danymi.
         * @throws Exception Gdy użytkownik nie istnieje lub aktualizacja się nie powiedzie.
         */
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
