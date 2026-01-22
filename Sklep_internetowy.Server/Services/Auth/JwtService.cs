using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Sklep_internetowy.Server.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Sklep_internetowy.Server.Services.Auth
{
    /**
     * @class JwtService
     * @brief Serwis odpowiedzialny za generowanie tokenów JWT dla użytkowników.
     * @details Tworzy token JWT zawierający dane użytkownika oraz jego role
     * na podstawie ustawień z klasy AuthSettings.
     */
    public class JwtService(IOptions<AuthSettings> options, UserManager<User> userManager)
    {
        /**
         * @brief Generuje token JWT dla podanego użytkownika.
         * @param user Obiekt użytkownika, dla którego generowany jest token.
         * @return Ciąg znaków reprezentujący token JWT.
         */
        public async Task<string> GenerateToken(User user)
        {
            /**
             * @brief Lista claimów umieszczanych w tokenie JWT.
             * @details Zawiera podstawowe informacje identyfikujące użytkownika.
             */
            var claims = new List<Claim> {
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),

                new Claim(ClaimTypes.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            /**
             * @brief Pobranie ról przypisanych do użytkownika.
             */
            var roles = await userManager.GetRolesAsync(user);

            /**
             * @brief Dodanie ról użytkownika do listy claimów.
             */
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            /**
             * @brief Utworzenie obiektu tokena JWT.
             */
            var jwtToken = new JwtSecurityToken(
                expires: DateTime.UtcNow.Add(options.Value.Expires),
                claims: claims,
                signingCredentials:
                    new SigningCredentials(
                        new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(options.Value.SecretKey)
                        ),
                        SecurityAlgorithms.HmacSha256
                    )
            );

            /**
             * @brief Serializacja tokena JWT do postaci tekstowej.
             */
            return new JwtSecurityTokenHandler().WriteToken(jwtToken);
        }
    }
}
