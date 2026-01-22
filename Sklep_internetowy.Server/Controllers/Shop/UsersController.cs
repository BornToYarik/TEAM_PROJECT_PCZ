using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs;
using System.Linq;

namespace Sklep_internetowy.Server.Controllers
{
    /// <summary>
    /// Kontroler API odpowiedzialny za udostepnianie informacji o uzytkownikach systemu.
    /// Umozliwia bezpieczne pobieranie danych profilowych przeksztalconych do formatu obiektow transferu danych (DTO).
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly StoreDbContext _context;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy UsersController.
        /// </summary>
        /// <param name="context">Kontekst bazy danych StoreDbContext wykorzystywany do dostepu do danych uzytkownikow.</param>
        public UsersController(StoreDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Pobiera pelna liste uzytkownikow zarejestrowanych w systemie.
        /// Metoda mapuje encje bazodanowe na bezpieczne obiekty UserDto, aby uniknac przesylania 
        /// wrazliwych danych (np. hasel) do klienta.
        /// </summary>
        /// <returns>Kolekcja obiektow UserDto zawierajaca podstawowe informacje o uzytkownikach.</returns>
        /// <response code="200">Zwraca liste uzytkownikow.</response>
        /// <remarks>
        /// Zapytanie wykorzystuje metode AsNoTracking() w celu zwiekszenia wydajnosci operacji tylko do odczytu.
        /// </remarks>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
        {
            return await _context.Users
                .Select(u => new UserDto
                {
                    Id = u.Id,
                    Email = u.Email,
                    FirstName = u.FirstName,
                    LastName = u.LastName
                })
                .AsNoTracking()
                .ToListAsync();
        }
    }
}