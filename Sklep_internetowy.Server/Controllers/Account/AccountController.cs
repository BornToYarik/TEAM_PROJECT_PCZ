using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Services.Auth;
using System.Security.Claims;

namespace Sklep_internetowy.Server.Controllers.Account
{
    /// <summary>
    /// Kontroler API odpowiedzialny za zarzadzanie danymi konta zalogowanego uzytkownika.
    /// Wymaga autoryzacji przy uzyciu schematu Bearer (token JWT).
    /// </summary>
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy AccountController.
        /// </summary>
        /// <param name="accountService">Serwis obslugujacy logike biznesowa kont uzytkownikow.</param>
        public AccountController(AccountService accountService)
        {
            _accountService = accountService;
        }

        /// <summary>
        /// Pobiera szczegolowe dane profilowe aktualnie uwierzytelnionego uzytkownika.
        /// </summary>
        /// <returns>Obiekt zawierajacy nazwe uzytkownika oraz adres e-mail.</returns>
        /// <response code="200">Zwraca dane profilowe uzytkownika.</response>
        /// <response code="401">Gdy struktura tokenu jest nieprawidlowa lub uzytkownik nie jest zalogowany.</response>
        /// <response code="404">Gdy uzytkownik nie figuruje w bazie danych.</response>
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value
                           ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userName))
                return Unauthorized(new { message = "Invalid token structure" });

            var user = await _accountService.GetUserByNameAsync(userName);

            if (user == null) return NotFound(new { message = "User not found in database" });

            return Ok(new
            {
                userName = user.UserName,
                email = user.Email
            });
        }

        /// <summary>
        /// Aktualizuje informacje o profilu zalogowanego uzytkownika (np. zmiana adresu e-mail).
        /// </summary>
        /// <param name="request">Obiekt DTO zawierajacy nowe dane do zapisu.</param>
        /// <returns>Komunikat o powodzeniu operacji lub opis bledu.</returns>
        /// <response code="200">Profil zostal pomyslnie zaktualizowany.</response>
        /// <response code="400">Gdy format zadania jest bledny lub wystapil blad podczas zapisu danych.</response>
        /// <response code="401">Gdy uzytkownik nie posiada uprawnien do wykonania akcji.</response>
        [HttpPut("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserRequest request)
        {
            var currentUserName = User.FindFirst(ClaimTypes.Name)?.Value
                                  ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(currentUserName))
                return Unauthorized(new { message = "Invalid token structure" });

            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid request format" });

            try
            {
                await _accountService.UpdateUserAsync(currentUserName, request);
                return Ok(new { message = "Profile updated successfully!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}