using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Yoga.Core.Entities;
using Yoga.Infrastructure.Data;

namespace Yoga.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ToursController : ControllerBase
    {
        private readonly YogaDbContext _context;

        public ToursController(YogaDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/tours
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tour>>> GetTours([FromQuery] int limit = 100, [FromQuery] int offset = 0)
        {
            var query = _context.Tours.AsQueryable();
            
            var totalCount = await query.CountAsync();
            Response.Headers.Append("X-Total-Count", totalCount.ToString());

            return await query
                .OrderByDescending(t => t.Id)
                .Skip(offset)
                .Take(limit)
                .ToListAsync();
        }

        // 2. GET: api/tours/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Tour>> GetTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);

            if (tour == null)
            {
                return NotFound($"Тур с ID {id} не найден");
            }

            return Ok(tour);
        }

        // 3. POST: api/tours (Создание тура)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Tour>> CreateTour(Tour tour)
        {
            // Проверка: Валидна ли модель? (например, есть ли обязательное поле Title)
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            _context.Tours.Add(tour);
            await _context.SaveChangesAsync();

            // Возвращаем 201 Created + header Location с адресом нового ресурса
            return CreatedAtAction(nameof(GetTour), new { id = tour.Id }, tour);
        }

        // 4. PUT: api/tours/5 (Обновление тура)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateTour(int id, Tour tour)
        {
            if (id != tour.Id)
            {
                return BadRequest("ID в URL и в теле запроса не совпадают");
            }

            // Говорим EF: "Этот объект изменен, следи за ним"
            _context.Entry(tour).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!TourExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent(); // 204 No Content (Успешно, но возвращать нечего)
        }

        // 5. DELETE: api/tours/5 (Удаление тура)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTour(int id)
        {
            var tour = await _context.Tours.FindAsync(id);
            if (tour == null)
            {
                return NotFound();
            }

            _context.Tours.Remove(tour);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Вспомогательный метод
        private bool TourExists(int id)
        {
            return _context.Tours.Any(e => e.Id == id);
        }
    }
}
