using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; }
        public string? Address { get; set; }

        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }
}
