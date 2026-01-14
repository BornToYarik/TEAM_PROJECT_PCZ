using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Mvc;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Microsoft.EntityFrameworkCore;

namespace Sklep_internetowy.Server.Controllers.Message
{
    [Route("api/panel/[controller]")]
    [ApiController]
    public class MessageController : Controller
    {
        private readonly StoreDbContext _context;

        public MessageController(StoreDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> PostMessage([FromBody] UserMessage message)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Message sent successfully" });
        }

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
