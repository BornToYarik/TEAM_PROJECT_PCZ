using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Sklep_internetowy.Server.Data;
using Sklep_internetowy.Server.Models;
using Sklep_internetowy.Server.DTOs;
using System.Linq;
using Sklep_internetowy.Server.Services;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly StoreDbContext _context;
    private readonly EmailService _emailService;

    public OrdersController(StoreDbContext context, EmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrderDetailsDto>>> GetOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.OrderProducts)
                .ThenInclude(op => op.Product)
            .Select(o => new OrderDetailsDto
            {
                Id = o.Id,
                UserId = o.UserId,
                UserEmail = o.User.Email,
                Status = o.Status,
                Products = o.OrderProducts.Select(op => new OrderProductDetailsDto
                {
                    ProductId = op.ProductId,
                    Name = op.Product.Name,
                    QuantityInOrder = op.Quantity,
                    QuantityInStock = op.Product.Quantity,
                    Price = op.Product.Price
                }).ToList()
            })
            .AsNoTracking()
            .ToListAsync();

        return Ok(orders);
    }

    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<OrderDetailsDto>>> GetUserOrders(string userId)
    {
        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.User)
            .Include(o => o.OrderProducts)
            .ThenInclude(op => op.Product)
            .OrderByDescending(o => o.OrderDate)
            .Select(o => new OrderDetailsDto
            {
                Id = o.Id,
                UserId = o.UserId,
                UserEmail = o.User.Email,
                Status = o.Status,
                OrderDate = o.OrderDate,
                Products = o.OrderProducts.Select(op => new OrderProductDetailsDto
                {
                    ProductId = op.ProductId,
                    Name = op.Product.Name,
                    QuantityInOrder = op.Quantity,
                    Price = op.Product.Price
                }).ToList()
            })
            .ToListAsync();

        return Ok(orders);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateOrder(int id, [FromBody] OrderUpdateDto dto)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderProducts)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound("Order not found");
                }

                order.Status = dto.Status;

                foreach (var item in dto.Products)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        throw new Exception($"Product {item.ProductId} not found");
                    }

                    var currentQtyInOrder = order.OrderProducts
                        .FirstOrDefault(p => p.ProductId == item.ProductId)?.Quantity ?? 0;

                    int availableStock = product.Quantity + currentQtyInOrder;

                    if (item.Quantity > availableStock)
                    {
                        throw new Exception($"Not enough stock for {product.Name}. Available: {availableStock}, Requested: {item.Quantity}");
                    }

                    product.Quantity = availableStock - item.Quantity;
                }

                _context.OrderProducts.RemoveRange(order.OrderProducts);

                foreach (var item in dto.Products)
                {
                    if (item.Quantity > 0)
                    {
                        _context.OrderProducts.Add(new OrderProduct
                        {
                            OrderId = order.Id,
                            ProductId = item.ProductId,
                            Quantity = item.Quantity
                        });
                    }
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteOrder(int id)
    {
        using (var transaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderProducts)
                    .FirstOrDefaultAsync(o => o.Id == id);

                if (order == null)
                {
                    return NotFound();
                }

                foreach (var op in order.OrderProducts)
                {
                    var product = await _context.Products.FindAsync(op.ProductId);
                    if (product != null)
                    {
                        product.Quantity += op.Quantity;
                    }
                }

                await _context.SaveChangesAsync();

                _context.Orders.Remove(order);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return NoContent();
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, "Error restoring stock. Deletion cancelled.");
            }
        }
    }

    [HttpPost]
    public async Task<ActionResult<OrderDetailsDto>> CreateOrder([FromBody] CreateOrderRequestDto dto)
    {
        var user = await _context.Users.FindAsync(dto.UserId);
        if (user == null)
        {
            return BadRequest(new { message = $"User with id {dto.UserId} not found." });
        }

        using (var transaction = await _context.Database.BeginTransactionAsync())
        {
            try
            {
                var newOrder = new Order
                {
                    UserId = dto.UserId,
                    Status = "Pending"
                };

                _context.Orders.Add(newOrder);
                await _context.SaveChangesAsync();

                var productDetailsForDto = new List<OrderProductDetailsDto>();
                decimal totalAmount = 0;

                foreach (var item in dto.Products)
                {
                    var product = await _context.Products.FindAsync(item.ProductId);
                    if (product == null)
                    {
                        throw new Exception($"Product with id {item.ProductId} not found");
                    }

                    if (product.Quantity < item.Quantity)
                    {
                        throw new Exception($"Not enough stock for {product.Name}. Available: {product.Quantity}, Requested: {item.Quantity}");
                    }

                    product.Quantity -= item.Quantity;

                    var orderProduct = new OrderProduct
                    {
                        OrderId = newOrder.Id,
                        ProductId = item.ProductId,
                        Quantity = item.Quantity
                    };
                    _context.OrderProducts.Add(orderProduct);

                    totalAmount += product.Price * item.Quantity;

                    productDetailsForDto.Add(new OrderProductDetailsDto
                    {
                        ProductId = product.Id,
                        Name = product.Name,
                        QuantityInOrder = item.Quantity,
                        QuantityInStock = product.Quantity,
                        Price = product.Price
                    });
                }

                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                try
                {
                    await _emailService.SendOrderConfirmationAsync(
                        user.Email,
                        newOrder.Id,
                        totalAmount,
                        newOrder.OrderDate.ToString("yyyy-MM-dd HH:mm")
                    );
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Błąd wysyłania maila: {ex.Message}");
                }

                var resultDto = new OrderDetailsDto
                {
                    Id = newOrder.Id,
                    UserId = newOrder.UserId,
                    UserEmail = user.Email,
                    Status = newOrder.Status,
                    Products = productDetailsForDto
                };

                return CreatedAtAction(nameof(GetOrders), new { id = newOrder.Id }, resultDto);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}