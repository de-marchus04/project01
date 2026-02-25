using System;

namespace Yoga.Core.Entities
{
    public class Consultation
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty; // e.g., "Private Training"
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public int DurationMinutes { get; set; } // e.g., 60, 90
        public string ExpertName { get; set; } = string.Empty; // Who conducts it
        public string Category { get; set; } = "General"; // e.g. "Private", "Nutrition", "Mentorship"
    }
}
