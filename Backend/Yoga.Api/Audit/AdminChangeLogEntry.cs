namespace Yoga.Api.Audit;

public class AdminChangeLogEntry
{
    public DateTime TimestampUtc { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Method { get; set; } = string.Empty;
    public string Path { get; set; } = string.Empty;
    public int StatusCode { get; set; }
}
