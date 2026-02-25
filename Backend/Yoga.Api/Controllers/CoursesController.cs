using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Yoga.Application.Features.Courses.Catalog;
using Yoga.Core.Entities;
using Yoga.Infrastructure.Data;
using Yoga.Infrastructure.Features.Courses;

namespace Yoga.Infrastructure.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CoursesController : ControllerBase
    {
        private readonly YogaDbContext _context;
        private readonly ICoursesCatalogService _catalogService;
        private readonly IMemoryCache? _memoryCache;

        public CoursesController(YogaDbContext context, ICoursesCatalogService catalogService, IMemoryCache? memoryCache = null)
        {
            _context = context;
            _catalogService = catalogService;
            _memoryCache = memoryCache;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses()
        {
            return await _context.Courses.ToListAsync();
        }

        [HttpGet("catalog")]
        public async Task<ActionResult<CoursesCatalogResponseDto>> GetCatalog(
            [FromQuery] string? pageName,
            [FromQuery] string? search,
            [FromQuery] string? sort,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 6,
            CancellationToken cancellationToken = default)
        {
            var response = await _catalogService.GetCatalogAsync(new CoursesCatalogQuery
            {
                PageName = pageName,
                Search = search,
                Sort = sort ?? "newest",
                Page = page,
                PageSize = pageSize
            }, cancellationToken);

            return Ok(response);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<Course>> CreateCourse(Course course)
        {
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            _memoryCache?.Remove(CourseCatalogRepository.CatalogCacheKey);

            return CreatedAtAction("GetCourse", new { id = course.Id }, course);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateCourse(int id, Course course)
        {
            if (id != course.Id)
            {
                return BadRequest();
            }

            _context.Entry(course).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CourseExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            _memoryCache?.Remove(CourseCatalogRepository.CatalogCacheKey);
            return NoContent();
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound();
            }

            _context.Courses.Remove(course);
            await _context.SaveChangesAsync();
            _memoryCache?.Remove(CourseCatalogRepository.CatalogCacheKey);

            return NoContent();
        }

        private bool CourseExists(int id)
        {
            return _context.Courses.Any(e => e.Id == id);
        }
    }
}
