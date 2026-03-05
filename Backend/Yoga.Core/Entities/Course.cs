using System;
using System.Collections.Generic;

namespace Yoga.Core.Entities
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Category { get; set; } = "General";
        public string Level { get; set; } = "Beginner";
        public int DurationWeeks { get; set; }

        private static readonly HashSet<string> ValidLevels = new(StringComparer.OrdinalIgnoreCase)
        {
            "Beginner", "Intermediate", "Advanced", "All Levels"
        };

        public IReadOnlyList<string> Validate()
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(Title))
                errors.Add("Title is required.");
            else if (Title.Length > 200)
                errors.Add("Title must not exceed 200 characters.");

            if (Price < 0)
                errors.Add("Price cannot be negative.");

            if (!string.IsNullOrWhiteSpace(Level) && !ValidLevels.Contains(Level))
                errors.Add($"Level must be one of: {string.Join(", ", ValidLevels)}.");

            if (DurationWeeks < 0)
                errors.Add("Duration cannot be negative.");

            if (string.IsNullOrWhiteSpace(Category))
                errors.Add("Category is required.");

            return errors;
        }

        public bool IsValid() => Validate().Count == 0;
    }
}
