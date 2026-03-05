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
    /// <summary>
    /// Manages yoga courses: listing, catalog search, and CRUD operations.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
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

        /// <summary>
        /// Returns a paginated list of all courses.
        /// </summary>
        /// <param name="limit">Maximum number of courses to return (default 100).</param>
        /// <param name="offset">Number of courses to skip (default 0).</param>
        /// <returns>List of courses with X-Total-Count header.</returns>
        /// <response code="200">Courses retrieved successfully.</response>
        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Course>), StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Course>>> GetCourses([FromQuery] int limit = 100, [FromQuery] int offset = 0)
        {
            var query = _context.Courses.AsQueryable();

            var totalCount = await query.CountAsync();
            Response.Headers.Append("X-Total-Count", totalCount.ToString());

            return await query
                .OrderByDescending(c => c.Id)
                .Skip(offset)
                .Take(limit)
                .ToListAsync();
        }

        /// <summary>
        /// Returns a filtered and paginated course catalog.
        /// </summary>
        /// <param name="pageName">Page scope filter (e.g. courses-beginners, courses-back, courses-meditation, courses-women).</param>
        /// <param name="search">Full-text search query across title and description.</param>
        /// <param name="sort">Sort order: newest, price-asc, price-desc, title-asc.</param>
        /// <param name="page">Page number (default 1).</param>
        /// <param name="pageSize">Items per page, 1-50 (default 6).</param>
        /// <param name="cancellationToken">Cancellation token.</param>
        /// <returns>Paginated catalog with items and total count.</returns>
        /// <response code="200">Catalog retrieved successfully.</response>
        [HttpGet("catalog")]
        [ProducesResponseType(typeof(CoursesCatalogResponseDto), StatusCodes.Status200OK)]
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

        /// <summary>
        /// Returns a single course by its ID.
        /// </summary>
        /// <param name="id">Course ID.</param>
        /// <returns>The course if found.</returns>
        /// <response code="200">Course found.</response>
        /// <response code="404">Course not found.</response>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Course), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Course>> GetCourse(int id)
        {
            var course = await _context.Courses.FindAsync(id);

            if (course == null)
            {
                return NotFound();
            }

            return course;
        }

        /// <summary>
        /// Creates a new course. Requires Admin role.
        /// </summary>
        /// <param name="course">Course data.</param>
        /// <returns>The created course.</returns>
        /// <response code="201">Course created successfully.</response>
        /// <response code="401">Not authenticated.</response>
        /// <response code="403">Not authorized (admin only).</response>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(Course), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<Course>> CreateCourse(Course course)
        {
            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            _memoryCache?.Remove(CourseCatalogRepository.CatalogCacheKey);

            return CreatedAtAction("GetCourse", new { id = course.Id }, course);
        }

        /// <summary>
        /// Updates an existing course. Requires Admin role.
        /// </summary>
        /// <param name="id">Course ID to update.</param>
        /// <param name="course">Updated course data (ID must match route).</param>
        /// <response code="204">Course updated successfully.</response>
        /// <response code="400">ID mismatch between route and body.</response>
        /// <response code="404">Course not found.</response>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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

        /// <summary>
        /// Deletes a course. Requires Admin role.
        /// </summary>
        /// <param name="id">Course ID to delete.</param>
        /// <response code="204">Course deleted successfully.</response>
        /// <response code="404">Course not found.</response>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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
