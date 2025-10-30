using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Services.Auth;

namespace Sklep_internetowy.Server.Controllers.Auth
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AccountService _accountServcice;

        private readonly IConfiguration _configuration;

        public AuthController(AccountService AccountServcice, IConfiguration configuration)
        {
            _accountServcice = AccountServcice;
            _configuration = configuration;
        }

        public IActionResult Register([FromBody] RegisterUserRequest request)
        {
            _accountServcice.Register(request.UserName, request.Email, request.Password);
            return Ok(new { message = "Rejestracja powiodla się pomyślnie" });
        }


        public IActionResult Login([FromBody] LoginRequest request)
        {
            return Ok(_accountServcice.Login(request.Email, request.Password));
        }
    }
}
