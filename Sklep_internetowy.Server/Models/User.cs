using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{

    public class User : IdentityUser
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;


        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
    
}
