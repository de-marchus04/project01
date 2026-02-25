namespace Yoga.Application.Exceptions;

public class ValidationException : Exception
{
    public IDictionary<string, string[]> Errors { get; }

    public ValidationException()
        : base("One or more validation failures have occurred.")
    {
        Errors = new Dictionary<string, string[]>();
    }

    public ValidationException(IEnumerable<KeyValuePair<string, string[]>> failures)
        : this()
    {
        Errors = failures.ToDictionary(f => f.Key, f => f.Value);
    }
}
