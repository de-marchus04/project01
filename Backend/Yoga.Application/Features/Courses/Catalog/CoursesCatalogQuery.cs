namespace Yoga.Application.Features.Courses.Catalog;

public sealed class CoursesCatalogQuery
{
    public string? PageName { get; init; }
    public string? Search { get; init; }
    public string Sort { get; init; } = "newest";
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 6;
}
