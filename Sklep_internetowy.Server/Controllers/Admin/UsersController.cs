using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.DTOs;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    /// <summary>
    /// Kontroler administracyjny odpowiedzialny za zarzadzanie kontami uzytkownikow i ich uprawnieniami (rolami).
    /// Umozliwia pelny cykl zycia uzytkownika, w tym tworzenie, edycje, usuwanie oraz resetowanie hasel.
    /// </summary>
    [ApiController]
    [Route("api/admin/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy UsersController.
        /// </summary>
        /// <param name="userManager">Menedzer uzytkownikow systemu Identity.</param>
        /// <param name="roleManager">Menedzer rol systemu Identity.</param>
        public UsersController(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        /// <summary>
        /// Pobiera liste wszystkich uzytkownikow zarejestrowanych w systemie wraz z ich rolami.
        /// </summary>
        /// <returns>Kolekcja obiektow UserDto zawierajaca podstawowe dane profilowe i przypisane role.</returns>
        /// <response code="200">Zwraca liste uzytkownikow.</response>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userManager.Users.ToListAsync();
            var userDtos = new List<UserDto>();

            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    Roles = roles,
                    CreatedAt = user.CreatedAt
                });
            }

            return Ok(userDtos);
        }

        /// <summary>
        /// Pobiera szczegolowe dane konkretnego uzytkownika na podstawie identyfikatora ID.
        /// </summary>
        /// <param name="id">Unikalny identyfikator uzytkownika (GUID).</param>
        /// <returns>Obiekt UserDto lub blad 404, jesli uzytkownik nie istnieje.</returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Roles = roles,
                CreatedAt = user.CreatedAt
            });
        }

        /// <summary>
        /// Tworzy nowe konto uzytkownika i przypisuje mu zdefiniowane role systemowe.
        /// </summary>
        /// <param name="dto">Dane rejestracyjne uzytkownika (email, haslo, role).</param>
        /// <returns>Dane nowo utworzonego uzytkownika.</returns>
        /// <response code="200">Uzytkownik zostal utworzony.</response>
        /// <response code="400">Gdy walidacja danych lub proces tworzenia konta zakonczyl sie bledem.</response>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] RegisterUserRequest dto)
        {
            var user = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = dto.Email,
                UserName = dto.Email,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, dto.Password ?? "Default123!");
            if (!result.Succeeded) return BadRequest(result.Errors);

            if (dto.Roles != null)
            {
                foreach (var role in dto.Roles)
                {
                    if (await _roleManager.RoleExistsAsync(role))
                        await _userManager.AddToRoleAsync(user, role);
                }
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Roles = roles,
                CreatedAt = user.CreatedAt
            });
        }

        /// <summary>
        /// Aktualizuje dane istniejacego uzytkownika, w tym adres email oraz zestaw rol.
        /// Proces rol polega na usunieciu dotychczasowych i nadaniu nowych z zadania.
        /// </summary>
        /// <param name="id">ID uzytkownika do edycji.</param>
        /// <param name="dto">Obiekt zawierajacy zaktualizowany email oraz liste rol.</param>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UserUpdateDto dto)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            user.Email = dto.Email;
            user.UserName = dto.Email;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            var currentRoles = await _userManager.GetRolesAsync(user);

            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            if (dto.Roles != null)
            {
                foreach (var role in dto.Roles)
                {
                    if (await _roleManager.RoleExistsAsync(role))
                        await _userManager.AddToRoleAsync(user, role);
                }
            }

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Roles = roles,
                CreatedAt = user.CreatedAt
            });
        }

        /// <summary>
        /// Trwale usuwa konto uzytkownika z systemu. 
        /// Zawiera blokade uniemozliwiajaca administratorowi usuniecie samego siebie.
        /// </summary>
        /// <param name="id">ID uzytkownika przeznaczonego do usuniecia.</param>
        /// <returns>Komunikat o statusie operacji.</returns>
        /// <response code="200">Uzytkownik usuniety.</response>
        /// <response code="400">Gdy probowano usunac wlasne konto.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            /// Pobranie identyfikatora aktualnie zalogowanego uzytkownika wykonujacego akcje.
            var currentUserId = _userManager.GetUserId(User);

            if (id == currentUserId)
            {
                return BadRequest(new { message = "You cannot delete yourself." });
            }

            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { message = "User deleted" });
        }


        /// <summary>
        /// Resetuje haslo wybranego uzytkownika, generujac nowe, losowe haslo tymczasowe.
        /// </summary>
        /// <param name="id">ID uzytkownika, ktorego haslo ma zostac zresetowane.</param>
        /// <returns>Obiekt zawierajacy nowe haslo tymczasowe.</returns>
        [HttpPost("{id}/reset-password")]
        public async Task<IActionResult> ResetPassword(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return NotFound();

            var newPassword = Guid.NewGuid().ToString("N")[..8];
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);

            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok(new { newPassword });
        }
    }
}