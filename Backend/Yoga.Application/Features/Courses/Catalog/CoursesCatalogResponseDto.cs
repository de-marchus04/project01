namespace Yoga.Application.Features.Courses.Catalog;

public sealed class CoursesCatalogResponseDto
{
    public int Page { get; init; }
    public int PageSize { get; init; }
    public int Total { get; init; }
    public IReadOnlyList<CoursesCatalogItemDto> Items { get; init; } = Array.Empty<CoursesCatalogItemDto>();
}
