using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Sklep_internetowy.Server.Migrations
{
    /// <inheritdoc />
    public partial class Auction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AuctionId",
                table: "OrderProducts",
                type: "integer",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AuctionId",
                table: "OrderProducts");
        }
    }
}
