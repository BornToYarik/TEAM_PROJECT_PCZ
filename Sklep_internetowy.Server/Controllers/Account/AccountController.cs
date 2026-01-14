using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.DTOs;
using Sklep_internetowy.Server.Services.Auth;
using System.Security.Claims;

namespace Sklep_internetowy.Server.Controllers.Account 
{
    [Authorize(AuthenticationSchemes = "Bearer")]
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly AccountService _accountService;

        public AccountController(AccountService accountService)
        {
            _accountService = accountService;
        }

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