using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.DTOs; 
using System.Linq; 

[ApiController]
[Route("api/[controller]")] 
public class UsersController : ControllerBase
{
    private readonly StoreDbContext _context;

    public UsersController(StoreDbContext context)
    {
        _context = context;
    }

    // GET: /api/Users
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