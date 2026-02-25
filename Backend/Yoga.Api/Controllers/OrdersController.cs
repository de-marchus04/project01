using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Yoga.Infrastructure.Data;
using Yoga.Core.Entities;

namespace Yoga.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly YogaDbContext _context;

        public OrdersController(YogaDbContext context)
        {
            _context = context;
        }

        // POST: api/orders (Создать заявку без онлайн-оплаты)
        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] BookingRequest request)
        {
            if (request == null)
                return BadRequest("Request body is required");

            if (string.IsNullOrWhiteSpace(request.CustomerName) ||
                string.IsNullOrWhiteSpace(request.CustomerEmail) ||
                string.IsNullOrWhiteSpace(request.CustomerPhone))
            {
                return BadRequest("CustomerName, CustomerEmail and CustomerPhone are required");
            }

            var order = new Order
            {
                CustomerName = request.CustomerName.Trim(),
                CustomerEmail = request.CustomerEmail.Trim(),
                CustomerPhone = request.CustomerPhone.Trim(),
                UserName = ResolveUserName(request, User),
                TourId = request.TourId,
                CourseId = request.CourseId,
                ConsultationId = request.ConsultationId,
                ProductTitle = request.ProductTitle?.Trim() ?? string.Empty,
                ProductType = request.ProductType?.Trim() ?? "General",
                Date = DateTime.UtcNow,
                Status = "Pending",
                GiftMessage = request.Comment?.Trim() ?? string.Empty,
                IsGift = false
            };

            await FillOrderProductFieldsAsync(order);

            if (string.IsNullOrWhiteSpace(order.ProductTitle))
                return BadRequest("Unable to resolve product title. Provide ProductTitle or valid entity id.");

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(order);
        }

        // GET: api/orders (Для админа - все покупки + сумма)
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetOrders([FromQuery] int limit = 100, [FromQuery] int offset = 0)
        {
            var query = _context.Orders.AsQueryable();
            
            var totalCount = await query.CountAsync();
            Response.Headers.Append("X-Total-Count", totalCount.ToString());

            var orders = await query
                .OrderByDescending(o => o.Date)
                .Skip(offset)
                .Take(limit)
                .ToListAsync();

            return Ok(new 
            { 
                Orders = orders, 
                TotalIncome = await query.SumAsync(o => o.Price) 
            });
        }

        // GET: api/orders/applications (Для админа - заявки без прямой покупки)
        [HttpGet("applications")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<Order>>> GetApplications()
        {
            return await _context.Orders
                .OrderBy(o => o.Status == "Pending" ? 0 : 1)
                .ThenByDescending(o => o.Date)
                .ToListAsync();
        }
        
        // GET: api/orders/user/{username} (Для юзера - его покупки)
        [HttpGet("user/{username}")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Order>>> GetUserOrders(string username)
        {
            var currentUser = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
            var isAdmin = User.IsInRole("Admin");
            if (!isAdmin && !string.Equals(currentUser, username, StringComparison.OrdinalIgnoreCase))
                return Forbid();

            return await _context.Orders
                .Where(o => o.UserName == username)
                .OrderByDescending(o => o.Date)
                .ToListAsync();
        }

        // PUT: api/orders/{id}/cancel (Отмена заказа)
        [HttpPut("{id}/cancel")]
           [Authorize]
        public async Task<IActionResult> CancelOrder(int id)
        {
             var order = await _context.Orders.FindAsync(id);
             if (order == null) return NotFound();

               var currentUser = User.FindFirstValue(ClaimTypes.Name) ?? string.Empty;
               var isAdmin = User.IsInRole("Admin");
               if (!isAdmin && !string.Equals(currentUser, order.UserName, StringComparison.OrdinalIgnoreCase))
                  return Forbid();

             // Only allow cancellation if not already cancelled
             if (order.Status == "Cancelled") 
                 return BadRequest("Order is already cancelled");

             order.Status = "Cancelled";
             await _context.SaveChangesAsync();
             return Ok(order);
        }

        // PUT: api/orders/{id}/status (Универсальная смена статуса)
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateOrderStatusRequest request)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound();

            if (request == null || string.IsNullOrWhiteSpace(request.Status))
                return BadRequest("Status is required");

            var normalized = request.Status.Trim();
            var allowed = new[] { "Pending", "Approved", "Cancelled" };
            if (!allowed.Contains(normalized))
                return BadRequest("Status must be Pending, Approved or Cancelled");

            order.Status = normalized;
            await _context.SaveChangesAsync();
            return Ok(order);
        }

        // PUT: api/orders/{id}/approve (Одобрение заявки админом)
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ApproveOrder(int id)
        {
             var order = await _context.Orders.FindAsync(id);
             if (order == null) return NotFound();

             order.Status = "Approved";
             await _context.SaveChangesAsync();
             return Ok(order);
        }

        // DELETE: api/orders/{id} (Полное удаление заявки/заказа)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null)
                return NotFound();

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                DeletedOrderId = id,
                DeletedProduct = order.ProductTitle,
                DeletedCustomer = order.CustomerName
            });
        }

        private static string ResolveUserName(BookingRequest request, ClaimsPrincipal userPrincipal)
        {
            var principalUserName = userPrincipal?.FindFirstValue(ClaimTypes.Name);
            if (!string.IsNullOrWhiteSpace(principalUserName))
                return principalUserName.Trim();

            if (!string.IsNullOrWhiteSpace(request.UserName))
                return request.UserName.Trim();

            if (!string.IsNullOrWhiteSpace(request.CustomerEmail) && request.CustomerEmail.Contains('@'))
                return request.CustomerEmail.Split('@')[0].Trim();

            return "guest";
        }

        private async Task FillOrderProductFieldsAsync(Order order)
        {
            if (order.TourId.HasValue)
            {
                var tour = await _context.Tours.FindAsync(order.TourId.Value);
                if (tour != null)
                {
                    order.ProductTitle = string.IsNullOrWhiteSpace(order.ProductTitle) ? tour.Title : order.ProductTitle;
                    order.Price = tour.Price;
                    order.ProductType = "Tour";
                    return;
                }
            }

            if (order.CourseId.HasValue)
            {
                var course = await _context.Courses.FindAsync(order.CourseId.Value);
                if (course != null)
                {
                    order.ProductTitle = string.IsNullOrWhiteSpace(order.ProductTitle) ? course.Title : order.ProductTitle;
                    order.Price = course.Price;
                    order.ProductType = "Course";
                    return;
                }
            }

            if (order.ConsultationId.HasValue)
            {
                var consultation = await _context.Consultations.FindAsync(order.ConsultationId.Value);
                if (consultation != null)
                {
                    order.ProductTitle = string.IsNullOrWhiteSpace(order.ProductTitle) ? consultation.Title : order.ProductTitle;
                    order.Price = consultation.Price;
                    order.ProductType = "Consultation";
                    return;
                }
            }

            if (string.IsNullOrWhiteSpace(order.ProductType))
                order.ProductType = "General";
        }
    }

    public class BookingRequest
    {
        public string? UserName { get; set; }
        public string? ProductTitle { get; set; }
        public string? ProductType { get; set; }
        public int? TourId { get; set; }
        public int? CourseId { get; set; }
        public int? ConsultationId { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? Comment { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        public string? Status { get; set; }
    }
}