using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Yoga.Application.Features.Courses.Catalog;
using Yoga.Infrastructure.Controllers;
using Yoga.Infrastructure.Data;
using Xunit;

namespace Yoga.Api.Tests;

public class CoursesControllerCatalogTests
{
    [Fact]
    public async Task GetCatalog_ReturnsOkWithPayload()
    {
        var options = new DbContextOptionsBuilder<YogaDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        await using var context = new YogaDbContext(options);

        var expected = new CoursesCatalogResponseDto
        {
            Page = 1,
            PageSize = 6,
            Total = 1,
            Items = new[]
            {
                new CoursesCatalogItemDto
                {
                    Id = 1,
                    Title = "Йога-занятия",
                    Description = "Base",
                    Price = 1000,
                    ImageUrl = "img",
                    Level = "Beginner"
                }
            }
        };

        var service = new FakeCoursesCatalogService(expected);
        var controller = new CoursesController(context, service);

        var response = await controller.GetCatalog(pageName: "courses-beginners.html", search: null, sort: "newest", page: 1, pageSize: 6);

        var ok = Assert.IsType<OkObjectResult>(response.Result);
        var payload = Assert.IsType<CoursesCatalogResponseDto>(ok.Value);
        Assert.Equal(1, payload.Total);
        Assert.Single(payload.Items);
    }

    private sealed class FakeCoursesCatalogService : ICoursesCatalogService
    {
        private readonly CoursesCatalogResponseDto _response;

        public FakeCoursesCatalogService(CoursesCatalogResponseDto response)
        {
            _response = response;
        }

        public Task<CoursesCatalogResponseDto> GetCatalogAsync(CoursesCatalogQuery query, CancellationToken cancellationToken)
        {
            return Task.FromResult(_response);
        }
    }
}
