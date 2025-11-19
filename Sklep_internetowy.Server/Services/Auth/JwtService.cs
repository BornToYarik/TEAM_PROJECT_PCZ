using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Sklep_internetowy.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Sklep_internetowy.Server.Services.Auth
{
    public class JwtService(IOptions<AuthSettings> options)
    {
        public string GenerateToken(User user)
        {
            var claims = new List<Claim> {
                // ZMIANA: Używamy standardowego ClaimTypes.Name zamiast "userName"
                // Dzięki temu User.Identity.Name w kontrolerze zadziała automagicznie
                new Claim(ClaimTypes.Name, user.UserName),
                
                // Dobra praktyka: Dodaj też ID użytkownika (NameIdentifier)
                new Claim(ClaimTypes.NameIdentifier, user.UserName),

                new Claim(ClaimTypes.Email, user.Email)
            };

            var jwtToken = new JwtSecurityToken(
                expires: DateTime.UtcNow.Add(options.Value.Expires),
                claims: claims,
                signingCredentials:
                    new SigningCredentials(
                        new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Value.SecretKey))
                        , SecurityAlgorithms.HmacSha256)

                );
            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }
    }
}