using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    [Route("api/panel/[controller]")]
    [ApiController]
    public class UserMessageController : ControllerBase
    {
        private readonly StoreDbContext _context;

        public UserMessageController(StoreDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserMessage>>> GetAll()
        {
            var messages = await _context.Messages
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();

            return Ok(messages);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserMessage>> GetById(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();
            return Ok(message);
        }

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
