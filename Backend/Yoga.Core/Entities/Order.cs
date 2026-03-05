using System;
using System.Collections.Generic;

namespace Yoga.Core.Entities
{
    public class Order
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string ProductTitle { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string Status { get; set; } = "Completed";

        public int? TourId { get; set; }
        public int? CourseId { get; set; }
        public int? ConsultationId { get; set; }
        public string ProductType { get; set; } = "General";

        public string CustomerName { get; set; } = "";
        public string CustomerEmail { get; set; } = "";
        public string CustomerPhone { get; set; } = "";

        public bool IsGift { get; set; } = false;
        public string GiftMessage { get; set; } = "";

        private static readonly HashSet<string> ValidStatuses = new(StringComparer.OrdinalIgnoreCase)
        {
            "Pending", "Completed", "Cancelled", "Refunded"
        };

        private static readonly HashSet<string> ValidProductTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "General", "Course", "Tour", "Consultation"
        };

        public IReadOnlyList<string> Validate()
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(UserName) && string.IsNullOrWhiteSpace(CustomerName))
                errors.Add("Either UserName or CustomerName is required.");

            if (string.IsNullOrWhiteSpace(ProductTitle))
                errors.Add("ProductTitle is required.");

            if (Price < 0)
                errors.Add("Price cannot be negative.");

            if (!ValidStatuses.Contains(Status))
                errors.Add($"Status must be one of: {string.Join(", ", ValidStatuses)}.");

            if (!ValidProductTypes.Contains(ProductType))
                errors.Add($"ProductType must be one of: {string.Join(", ", ValidProductTypes)}.");

            if (!string.IsNullOrWhiteSpace(CustomerEmail) && !CustomerEmail.Contains('@'))
                errors.Add("CustomerEmail must be a valid email address.");

            return errors;
        }

        public bool IsValid() => Validate().Count == 0;
    }
}
