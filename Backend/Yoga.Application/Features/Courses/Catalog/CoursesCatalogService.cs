namespace Yoga.Application.Features.Courses.Catalog;

public sealed class CoursesCatalogService : ICoursesCatalogService
{
    private readonly ICourseCatalogRepository _repository;

    public CoursesCatalogService(ICourseCatalogRepository repository)
    {
        _repository = repository;
    }

    public async Task<CoursesCatalogResponseDto> GetCatalogAsync(CoursesCatalogQuery query, CancellationToken cancellationToken)
    {
        var page = Math.Max(1, query.Page);
        var pageSize = Math.Clamp(query.PageSize, 1, 50);
        var sort = string.IsNullOrWhiteSpace(query.Sort) ? "newest" : query.Sort.Trim().ToLowerInvariant();
        var search = query.Search?.Trim().ToLowerInvariant();
        var pageName = query.PageName?.Trim().ToLowerInvariant() ?? string.Empty;

        var source = await _repository.GetAllAsync(cancellationToken);

        IEnumerable<CourseCatalogSourceItem> filtered = source;
        filtered = ApplyPageScope(pageName, filtered);

        if (!string.IsNullOrWhiteSpace(search))
        {
            filtered = filtered.Where(item =>
                item.Title.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                item.Description.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        filtered = sort switch
        {
            "price-asc" => filtered.OrderBy(item => item.Price).ThenBy(item => item.Title),
            "price-desc" => filtered.OrderByDescending(item => item.Price).ThenBy(item => item.Title),
            "title-asc" => filtered.OrderBy(item => item.Title),
            _ => filtered.OrderByDescending(item => item.Id)
        };

        var total = filtered.Count();
        var items = filtered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(item => new CoursesCatalogItemDto
            {
                Id = item.Id,
                Title = item.Title,
                Description = item.Description,
                Price = item.Price,
                ImageUrl = item.ImageUrl,
                Level = item.Level
            })
            .ToList();

        return new CoursesCatalogResponseDto
        {
            Page = page,
            PageSize = pageSize,
            Total = total,
            Items = items
        };
    }

    private static IEnumerable<CourseCatalogSourceItem> ApplyPageScope(string pageName, IEnumerable<CourseCatalogSourceItem> items)
    {
        if (string.IsNullOrWhiteSpace(pageName))
            return items;

        if (pageName.Contains("courses-beginners"))
        {
            return items.Where(i =>
                i.Category.Contains("beginner", StringComparison.OrdinalIgnoreCase) ||
                i.Level.Equals("Beginner", StringComparison.OrdinalIgnoreCase) ||
                i.Level.Equals("All Levels", StringComparison.OrdinalIgnoreCase));
        }

        if (pageName.Contains("courses-back"))
        {
            return items.Where(i =>
                i.Category.Contains("back", StringComparison.OrdinalIgnoreCase) ||
                i.Title.Contains("back", StringComparison.OrdinalIgnoreCase) ||
                i.Title.Contains("spine", StringComparison.OrdinalIgnoreCase));
        }

        if (pageName.Contains("courses-meditation"))
        {
            return items.Where(i =>
                i.Category.Contains("meditation", StringComparison.OrdinalIgnoreCase) ||
                i.Title.Contains("meditation", StringComparison.OrdinalIgnoreCase));
        }

        if (pageName.Contains("courses-women"))
        {
            return items.Where(i =>
                i.Category.Contains("women", StringComparison.OrdinalIgnoreCase) ||
                i.Title.Contains("women", StringComparison.OrdinalIgnoreCase));
        }

        return items;
    }
}
