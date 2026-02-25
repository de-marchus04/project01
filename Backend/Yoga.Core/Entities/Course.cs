using System;

namespace Yoga.Core.Entities
{
    public class Course
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty; // e.g., "Yoga for Beginners"
        public string Subtitle { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty; // Detailed syllabus or body text
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public string Category { get; set; } = "General"; // e.g. "For Beginners", "Healthy Back", etc.
        public string Level { get; set; } = "Beginner"; // Beginner, Intermediate, Advanced
        public int DurationWeeks { get; set; } // Duration in weeks
    }
}
