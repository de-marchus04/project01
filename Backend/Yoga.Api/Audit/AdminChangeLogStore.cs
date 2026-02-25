using System.Text.Json;

namespace Yoga.Api.Audit;

public class AdminChangeLogStore
{
    private const int MaxEntries = 2000;
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true
    };

    private readonly string _filePath;
    private readonly SemaphoreSlim _sync = new(1, 1);

    public AdminChangeLogStore(IWebHostEnvironment env)
    {
        var dataDir = Path.Combine(env.ContentRootPath, "App_Data");
        Directory.CreateDirectory(dataDir);
        _filePath = Path.Combine(dataDir, "admin-change-log.json");
    }

    public async Task AppendAsync(AdminChangeLogEntry entry)
    {
        await _sync.WaitAsync();
        try
        {
            var entries = await ReadUnsafeAsync();
            entries.Insert(0, entry);

            if (entries.Count > MaxEntries)
            {
                entries = entries.Take(MaxEntries).ToList();
            }

            var json = JsonSerializer.Serialize(entries, JsonOptions);
            await File.WriteAllTextAsync(_filePath, json);
        }
        finally
        {
            _sync.Release();
        }
    }

    public async Task<IReadOnlyList<AdminChangeLogEntry>> GetLatestAsync(int take)
    {
        var normalizedTake = Math.Clamp(take, 1, 200);

        await _sync.WaitAsync();
        try
        {
            var entries = await ReadUnsafeAsync();
            return entries.Take(normalizedTake).ToList();
        }
        finally
        {
            _sync.Release();
        }
    }

    private async Task<List<AdminChangeLogEntry>> ReadUnsafeAsync()
    {
        if (!File.Exists(_filePath))
        {
            return new List<AdminChangeLogEntry>();
        }

        var json = await File.ReadAllTextAsync(_filePath);
        if (string.IsNullOrWhiteSpace(json))
        {
            return new List<AdminChangeLogEntry>();
        }

        try
        {
            var entries = JsonSerializer.Deserialize<List<AdminChangeLogEntry>>(json, JsonOptions);
            return entries ?? new List<AdminChangeLogEntry>();
        }
        catch
        {
            return new List<AdminChangeLogEntry>();
        }
    }
}
