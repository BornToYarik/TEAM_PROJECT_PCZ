using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Address { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
