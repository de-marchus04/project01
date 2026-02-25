using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Yoga.Core.Entities;
using Yoga.Infrastructure.Data;

namespace Yoga.Api.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductsController : ControllerBase
    {
        private readonly YogaDbContext _context;

        public ProductsController(YogaDbContext context)
        {
            _context = context;
        }

        [HttpGet("category/{category}")]
        public async Task<ActionResult<IEnumerable<object>>> GetByCategory(string category)
        {
            if (string.IsNullOrWhiteSpace(category))
                return BadRequest();

            category = category.ToLower().Trim();

            // Course categories known in Admin
            // beginners, back, meditation, women
            if (category == "beginners" || category == "back" || category == "meditation" || category == "women")
            {
                // Strict match first, fallback to partial title match if Category is empty (backward compatibility)
                var courses = await _context.Courses
                    .Where(c => c.Category.ToLower() == category || 
                               (string.IsNullOrEmpty(c.Category) && c.Title.ToLower().Contains(category)))
                    .ToListAsync();
                
                return Ok(courses.Select(c => new {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Price,
                    c.ImageUrl,
                    Type = "course"
                }));
            }
            
            // Consultation categories known in Admin
            // private, nutrition, mentorship
            // Frontend generic terms: 'consultation' -> 'private'
            
            string consultationCategory = category;
            if (category == "consultation") consultationCategory = "private"; // Map generic term to specific DB value

            if (category == "nutrition" || category == "mentorship" || category == "private" || category == "consultation")
            {
                var consultations = await _context.Consultations
                    .Where(c => c.Category.ToLower() == consultationCategory ||
                               (string.IsNullOrEmpty(c.Category) && c.Title.ToLower().Contains(consultationCategory)))
                    .ToListAsync();
                
                return Ok(consultations.Select(c => new {
                    c.Id,
                    c.Title,
                    c.Description,
                    c.Price,
                    c.ImageUrl,
                    Type = "consultation",
                    c.DurationMinutes,
                    c.ExpertName
                }));
            }

            return NotFound(new { Message = $"Category '{category}' not found" });
        }
    }
}
