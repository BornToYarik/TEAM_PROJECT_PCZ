using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    /// <summary>
    /// Kontroler API odpowiedzialny za zarzadzanie wiadomosciami kontaktowymi uzytkownikow.
    /// Umozliwia przegladanie, wyszukiwanie, tworzenie oraz edycje zgloszen w panelu administracyjnym.
    /// </summary>
    [Route("api/panel/[controller]")]
    [ApiController]
    public class UserMessageController : ControllerBase
    {
        private readonly StoreDbContext _context;

        /// <summary>
        /// Inicjalizuje nowa instancje klasy UserMessageController.
        /// </summary>
        /// <param name="context">Kontekst bazy danych StoreDbContext.</param>
        public UserMessageController(StoreDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Pobiera pelna liste wiadomosci zapisanych w systemie.
        /// Wiadomosci sa sortowane malejaco wedlug daty ich utworzenia.
        /// </summary>
        /// <returns>Kolekcja obiektow UserMessage.</returns>
        /// <response code="200">Zwraca liste wiadomosci.</response>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserMessage>>> GetAll()
        {
            var messages = await _context.Messages
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }

        /// <summary>
        /// Pobiera szczegolowe dane konkretnej wiadomosci na podstawie jej identyfikatora.
        /// </summary>
        /// <param name="id">Unikalny identyfikator wiadomosci (ID).</param>
        /// <returns>Obiekt UserMessage lub blad 404, jesli wiadomosc nie istnieje.</returns>
        /// <response code="200">Zwraca znaleziona wiadomosc.</response>
        /// <response code="404">Gdy wiadomosc o podanym ID nie zostala znaleziona.</response>
        [HttpGet("{id}")]
        public async Task<ActionResult<UserMessage>> GetById(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();
            return Ok(message);
        }

        /// <summary>
        /// Tworzy i zapisuje nowa wiadomosc w bazie danych.
        /// Automatycznie przypisuje aktualna date UTC do pola CreatedAt.
        /// </summary>
        /// <param name="message">Obiekt wiadomosci przeslany w korpusie zadania.</param>
        /// <returns>Obiekt nowo utworzonej wiadomosci wraz z linkiem do jej pobrania.</returns>
        /// <response code="201">Wiadomosc zostala pomyslnie utworzona.</response>
        /// <response code="400">Gdy model danych jest nieprawidlowy.</response>
        [HttpPost]
        public async Task<ActionResult<UserMessage>> Create(UserMessage message)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            message.CreatedAt = DateTime.UtcNow;
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = message.Id }, message);
        }

        /// <summary>
        /// Aktualizuje dane istniejacej wiadomosci kontaktowej.
        /// </summary>
        /// <param name="id">ID wiadomosci do aktualizacji.</param>
        /// <param name="updated">Zaktualizowany obiekt wiadomosci.</param>
        /// <returns>Brak zawartosci (204) w przypadku sukcesu lub blad walidacji.</returns>
        /// <response code="204">Dane zostaly pomyslnie zaktualizowane.</response>
        /// <response code="400">Gdy ID w sciezce nie zgadza sie z ID w obiekcie.</response>
        /// <response code="404">Gdy wiadomosc o podanym ID nie istnieje.</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, UserMessage updated)
        {
            if (id != updated.Id)
                return BadRequest();

            var existing = await _context.Messages.FindAsync(id);
            if (existing == null)
                return NotFound();

            existing.Email = updated.Email;
            existing.Name = updated.Name;
            existing.Phone = updated.Phone;
            existing.Content = updated.Content;

            _context.Entry(existing).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        /// <summary>
        /// Trwale usuwa wiadomosc z systemu.
        /// </summary>
        /// <param name="id">ID wiadomosci przeznaczonej do usuniecia.</param>
        /// <returns>Brak zawartosci (204) po pomyslnym usunieciu.</returns>
        /// <response code="204">Wiadomosc zostala usunieta.</response>
        /// <response code="404">Gdy wiadomosc nie istnieje.</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var msg = await _context.Messages.FindAsync(id);
            if (msg == null)
                return NotFound();

            _context.Messages.Remove(msg);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}