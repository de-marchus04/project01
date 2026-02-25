using Yoga.Domain.Common;

namespace Yoga.Domain.Entities;

public sealed class DomainUser : BaseEntity
{
    public required string Email { get; init; }
    public required string FullName { get; init; }
}
