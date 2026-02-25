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
            return items.Where(item =>
                string.Equals(item.Category, "beginners", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("начина", StringComparison.OrdinalIgnoreCase) ||
                item.Level.Contains("begin", StringComparison.OrdinalIgnoreCase));
        }

        if (pageName.Contains("courses-back"))
        {
            return items.Where(item =>
                string.Equals(item.Category, "back", StringComparison.OrdinalIgnoreCase) ||
                item.Description.Contains("back", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("спин", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("осанк", StringComparison.OrdinalIgnoreCase));
        }

        if (pageName.Contains("courses-meditation"))
        {
            return items.Where(item =>
                string.Equals(item.Category, "meditation", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("медита", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("meditation", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("pranayama", StringComparison.OrdinalIgnoreCase));
        }

        if (pageName.Contains("courses-women"))
        {
            return items.Where(item =>
                string.Equals(item.Category, "women", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("women", StringComparison.OrdinalIgnoreCase) ||
                item.Title.Contains("жен", StringComparison.OrdinalIgnoreCase));
        }

        return items;
    }
}
