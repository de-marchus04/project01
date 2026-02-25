using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Yoga.Application.Features.Courses.Catalog;
using Xunit;

namespace Yoga.Application.Tests;

public class CoursesCatalogServiceTests
{
    [Fact]
    public async Task GetCatalogAsync_FiltersByPageNameAndReturnsPagedItems()
    {
        var repo = new FakeCourseCatalogRepository(new[]
        {
            new CourseCatalogSourceItem { Id = 1, Title = "Йога-занятия", Description = "База", Price = 1000, Level = "Beginner", ImageUrl = "a" },
            new CourseCatalogSourceItem { Id = 2, Title = "Курс Медитации", Description = "Дыхание", Price = 2000, Level = "All", ImageUrl = "b" },
            new CourseCatalogSourceItem { Id = 3, Title = "Женское здоровье", Description = "Баланс", Price = 1500, Level = "All", ImageUrl = "c" }
        });

        var service = new CoursesCatalogService(repo);

        var result = await service.GetCatalogAsync(new CoursesCatalogQuery
        {
            PageName = "courses-beginners.html",
            Search = "йога",
            Sort = "newest",
            Page = 1,
            PageSize = 6
        }, CancellationToken.None);

        Assert.Equal(1, result.Total);
        Assert.Single(result.Items);
        Assert.Equal("Йога-занятия", result.Items[0].Title);
    }

    [Fact]
    public async Task GetCatalogAsync_AppliesPagination()
    {
        var items = Enumerable.Range(1, 15)
            .Select(index => new CourseCatalogSourceItem
            {
                Id = index,
                Title = $"Course {index}",
                Description = "Desc",
                Price = index,
                Level = "All",
                ImageUrl = "img"
            });

        var service = new CoursesCatalogService(new FakeCourseCatalogRepository(items));

        var result = await service.GetCatalogAsync(new CoursesCatalogQuery
        {
            Sort = "newest",
            Page = 2,
            PageSize = 5
        }, CancellationToken.None);

        Assert.Equal(15, result.Total);
        Assert.Equal(5, result.Items.Count);
        Assert.Equal(10, result.Items.First().Id);
    }

    private sealed class FakeCourseCatalogRepository : ICourseCatalogRepository
    {
        private readonly IReadOnlyList<CourseCatalogSourceItem> _items;

        public FakeCourseCatalogRepository(IEnumerable<CourseCatalogSourceItem> items)
        {
            _items = items.ToList();
        }

        public Task<IReadOnlyList<CourseCatalogSourceItem>> GetAllAsync(CancellationToken cancellationToken)
        {
            return Task.FromResult(_items);
        }
    }
}
