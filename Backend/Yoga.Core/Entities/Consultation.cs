using System;
using System.Collections.Generic;

namespace Yoga.Core.Entities
{
    public class Consultation
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public string ExpertName { get; set; } = string.Empty;
        public string Category { get; set; } = "General";

        private static readonly HashSet<string> ValidCategories = new(StringComparer.OrdinalIgnoreCase)
        {
            "General", "Private", "Nutrition", "Mentorship"
        };

        public IReadOnlyList<string> Validate()
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(Title))
                errors.Add("Title is required.");

            if (Price < 0)
                errors.Add("Price cannot be negative.");

            if (DurationMinutes <= 0)
                errors.Add("Duration must be positive.");

            if (string.IsNullOrWhiteSpace(ExpertName))
                errors.Add("ExpertName is required.");

            if (!ValidCategories.Contains(Category))
                errors.Add($"Category must be one of: {string.Join(", ", ValidCategories)}.");

            return errors;
        }

        public bool IsValid() => Validate().Count == 0;
    }
}
