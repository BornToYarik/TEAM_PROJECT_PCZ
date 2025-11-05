using System.ComponentModel.DataAnnotations;

namespace Sklep_internetowy.Server.Models
{
    public class Order
    {
        public int Id { get; set; }

        public string UserId { get; set; }
        public User User { get; set; } = null!;

        public string Status { get; set; } = "pending";

        public ICollection<OrderProduct> OrderProducts { get; set; } = new List<OrderProduct>();
    }
}
