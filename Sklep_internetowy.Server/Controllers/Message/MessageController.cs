using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Sklep_internetowy.Server.Controllers.Message
{
    /// <summary>
    /// Kontroler API odpowiedzialny za obsluge wiadomosci kontaktowych przesylanych przez uzytkownikow.
    /// Modul umozliwia zapisywanie nowych zgloszen oraz ich odczyt w panelu administracyjnym.
    /// </summary>
    [Route("api/panel/[controller]")]
    [ApiController]
    public class MessageController : Controller
    {
        private readonly StoreDbContext _context;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy MessageController.
        /// </summary>
        /// <param name="context">Kontekst bazy danych StoreDbContext do obslugi operacji na wiadomosciach.</param>
        public MessageController(StoreDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Przyjmuje nowa wiadomosc uzytkownika i zapisuje ja w bazie danych.
        /// </summary>
        /// <param name="message">Obiekt UserMessage przekazany w korpusie zadania.</param>
        /// <returns>Status powodzenia operacji wraz z komunikatem potwierdzajacym.</returns>
        /// <response code="200">Wiadomosc zostala pomyslnie zapisana.</response>
        /// <response code="400">Gdy przeslany model danych jest nieprawidlowy.</response>
        [HttpPost]
        public async Task<IActionResult> PostMessage([FromBody] UserMessage message)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Message sent successfully" });
        }

        /// <summary>
        /// Pobiera pelna liste wiadomosci uzytkownikow zapisanych w systemie.
        /// Wyniki sa sortowane malejaco wedlug daty utworzenia.
        /// </summary>
        /// <returns>Kolekcja obiektow UserMessage reprezentujacych zgloszenia.</returns>
        /// <response code="200">Zwraca liste wiadomosci.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserMessage>>> GetMessages()
        {
            var messages = await _context.Messages
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }

    }
}