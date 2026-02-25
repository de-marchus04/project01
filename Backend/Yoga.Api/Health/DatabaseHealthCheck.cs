using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Yoga.Infrastructure.Data;

namespace Yoga.Api.Health;

public sealed class DatabaseHealthCheck : IHealthCheck
{
    private readonly YogaDbContext _context;

    public DatabaseHealthCheck(YogaDbContext context)
    {
        _context = context;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            var canConnect = await _context.Database.CanConnectAsync(cancellationToken);
            return canConnect
                ? HealthCheckResult.Healthy("Database is reachable")
                : HealthCheckResult.Unhealthy("Database connection failed");
        }
        catch (Exception exception)
        {
            return HealthCheckResult.Unhealthy("Database health check failed", exception);
        }
    }
}
