namespace Sklep_internetowy.Server.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;
        public string Role { get; set; } = "User"; 
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<CartItem>? CartItems { get; set; }
        public ICollection<Order>? Orders { get; set; }
    }
}
