using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Yoga.Application.Features.Courses.Catalog;
using Yoga.Infrastructure.Features.Courses;
using Yoga.Infrastructure.Data;

namespace Yoga.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<YogaDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddScoped<ICourseCatalogRepository, CourseCatalogRepository>();

        return services;
    }
}
