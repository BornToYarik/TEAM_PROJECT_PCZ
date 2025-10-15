﻿namespace Sklep_internetowy.Server.Models
{
    public class Category
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = null!;
        public string Description { get; set; } = null!;
        public ICollection<Product>? Products { get; set; }
    }
}
