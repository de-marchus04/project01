using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Yoga.Api.Audit;

namespace Yoga.Api.Controllers;

[ApiController]
[Route("api/admin-changes")]
[Authorize(Roles = "Admin")]
public class AdminChangesController : ControllerBase
{
    private readonly AdminChangeLogStore _store;

    public AdminChangesController(AdminChangeLogStore store)
    {
        _store = store;
    }

    [HttpGet]
    public async Task<IActionResult> GetChanges([FromQuery] int take = 100)
    {
        var changes = await _store.GetLatestAsync(take);
        return Ok(changes);
    }
}
