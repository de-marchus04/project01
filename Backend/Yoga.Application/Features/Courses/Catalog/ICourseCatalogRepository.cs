namespace Yoga.Application.Features.Courses.Catalog;

public interface ICourseCatalogRepository
{
    Task<IReadOnlyList<CourseCatalogSourceItem>> GetAllAsync(CancellationToken cancellationToken);
}
