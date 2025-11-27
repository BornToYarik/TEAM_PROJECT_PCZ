using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Sklep_internetowy.Server.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Description", "DiscountEndDate", "DiscountPercentage", "DiscountStartDate", "Name", "Price", "ProductCategoryId", "Quantity" },
                values: new object[,]
                {
                    { 33, "High performance laptop", null, null, null, "Laptop B", 1500.00m, 1, 0 },
                    { 50, "High performance laptop", null, null, null, "Laptop A", 1500.00m, 1, 0 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 50);
        }
    }
}
