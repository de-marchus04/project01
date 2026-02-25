using System.Security.Claims;

namespace Yoga.Api.Audit;

public class AdminAuditMiddleware
{
    private readonly RequestDelegate _next;

    public AdminAuditMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, AdminChangeLogStore store)
    {
        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? string.Empty;

        var isTrackedMethod = HttpMethods.IsPost(method) || HttpMethods.IsPut(method) || HttpMethods.IsDelete(method);
        var isApiCall = path.StartsWith("/api", StringComparison.OrdinalIgnoreCase);
        var isLogEndpoint = path.StartsWith("/api/admin-changes", StringComparison.OrdinalIgnoreCase);

        await _next(context);

        if (!isTrackedMethod || !isApiCall || isLogEndpoint)
        {
            return;
        }

        var isAdmin = context.User?.IsInRole("Admin") == true;
        if (!isAdmin)
        {
            return;
        }

        if (context.Response.StatusCode >= 400)
        {
            return;
        }

        var username = context.User?.FindFirstValue(ClaimTypes.Name) ?? "admin";

        await store.AppendAsync(new AdminChangeLogEntry
        {
            TimestampUtc = DateTime.UtcNow,
            Username = username,
            Method = method,
            Path = path,
            StatusCode = context.Response.StatusCode
        });
    }
}
