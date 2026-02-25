namespace Yoga.Application.Features.Courses.Catalog;

public sealed class CoursesCatalogItemDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public string ImageUrl { get; init; } = string.Empty;
    public string Level { get; init; } = string.Empty;
}
