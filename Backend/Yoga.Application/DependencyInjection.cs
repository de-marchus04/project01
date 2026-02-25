using Microsoft.Extensions.DependencyInjection;
using Yoga.Application.Features.Courses.Catalog;
using FluentValidation;
using System.Reflection;

namespace Yoga.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<ICoursesCatalogService, CoursesCatalogService>();
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());
        return services;
    }
}
