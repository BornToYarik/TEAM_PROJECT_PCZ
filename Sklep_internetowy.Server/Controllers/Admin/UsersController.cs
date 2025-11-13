using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using System;

namespace Sklep_internetowy.Server.Controllers.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly  StoreDbContext _context;
        public UsersController(StoreDbContext context)
        {
            _context = context;
        }

        
        [HttpGet("adminGet")]
        public async Task<ActionResult<IEnumerable<User>>> GetAll()
        {
            return await _context.Users.ToListAsync();
        }

        
        [HttpPut("adminPut{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.Email = updatedUser.Email;
           // user.Role = updatedUser.Role;      póżniej zrobimy podzial na role ...

            await _context.SaveChangesAsync();
            return Ok(user);
        }
    }
}
