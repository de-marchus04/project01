using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Yoga.Application.Features.Courses.Catalog;
using Yoga.Infrastructure.Data;

namespace Yoga.Infrastructure.Features.Courses;

public sealed class CourseCatalogRepository : ICourseCatalogRepository
{
    public const string CatalogCacheKey = "courses-catalog:all";

    private readonly YogaDbContext _context;
    private readonly IMemoryCache _memoryCache;

    public CourseCatalogRepository(YogaDbContext context, IMemoryCache memoryCache)
    {
        _context = context;
        _memoryCache = memoryCache;
    }

    public async Task<IReadOnlyList<CourseCatalogSourceItem>> GetAllAsync(CancellationToken cancellationToken)
    {
        if (_memoryCache.TryGetValue<IReadOnlyList<CourseCatalogSourceItem>>(CatalogCacheKey, out var cached) && cached is not null)
        {
            return cached;
        }

        var items = await _context.Courses
            .AsNoTracking()
            .Select(course => new CourseCatalogSourceItem
            {
                Id = course.Id,
                Title = course.Title,
                Description = course.Description,
                Price = course.Price,
                ImageUrl = course.ImageUrl,
                Category = course.Category,
                Level = course.Level
            })
            .ToListAsync(cancellationToken);

        _memoryCache.Set(CatalogCacheKey, items, TimeSpan.FromMinutes(10));
        return items;
    }
}
