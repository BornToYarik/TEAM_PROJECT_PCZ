using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Services.Auth;

namespace Sklep_internetowy.Server.Controllers.Auth
{
    /// <summary>
    /// Kontroler API odpowiedzialny za procesy uwierzytelniania i autoryzacji uzytkownikow.
    /// Obsluguje operacje rejestracji nowych kont oraz logowania (generowania tokenow JWT).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AccountService _accountService;

        private readonly IConfiguration _configuration;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy AuthController.
        /// </summary>
        /// <param name="AccountServcice">Serwis zarzadzajacy kontami uzytkownikow i logika uwierzytelniania.</param>
        /// <param name="configuration">Interfejs dostepu do konfiguracji aplikacji (np. ustawienia JWT).</param>
        public AuthController(AccountService AccountServcice, IConfiguration configuration)
        {
            _accountService = AccountServcice;
            _configuration = configuration;
        }

        /// <summary>
        /// Rejestruje nowego uzytkownika w systemie.
        /// </summary>
        /// <param name="request">Obiekt DTO zawierajacy nazwe uzytkownika, e-mail oraz haslo.</param>
        /// <returns>Komunikat o pomyslnej rejestracji lub blad walidacji.</returns>
        /// <response code="200">Uzytkownik zostal pomyslnie zarejestrowany.</response>
        /// <response code="400">Gdy dane wejsciowe sa nieprawidlowe lub proces rejestracji sie nie powiodl.</response>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid request" });

            try
            {
                await _accountService.Register(request.UserName, request.Email, request.Password);
                return Ok(new { message = "Registration succesfull!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Loguje uzytkownika do systemu i zwraca token autoryzacyjny.
        /// </summary>
        /// <param name="request">Obiekt DTO zawierajacy poswiadczenia (login i haslo).</param>
        /// <returns>Token JWT oraz podstawowe dane uzytkownika (ID, e-mail).</returns>
        /// <response code="200">Zwraca token dostępowy oraz dane zalogowanego profilu.</response>
        /// <response code="400">Gdy poswiadczenia sa bledne lub wystapil blad serwera.</response>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(new { message = "Invalid request" });

            try
            {
                var result = await _accountService.Login(request.UserName, request.Password);

                return Ok(new
                {
                    token = result.Token,
                    userId = result.User.Id,
                    email = result.User.Email,
                    message = "Login successfull!"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}