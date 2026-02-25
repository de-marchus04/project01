namespace Yoga.Application.Features.Courses.Catalog;

public interface ICoursesCatalogService
{
    Task<CoursesCatalogResponseDto> GetCatalogAsync(CoursesCatalogQuery query, CancellationToken cancellationToken);
}
