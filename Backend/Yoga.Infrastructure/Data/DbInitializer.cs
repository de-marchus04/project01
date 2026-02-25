using Yoga.Core.Entities;

namespace Yoga.Infrastructure.Data;

public static class DbInitializer
{
    public static void Initialize(YogaDbContext context)
    {
        CleanupDeprecatedPrograms(context);

        var tours = new Tour[]
        {
            new Tour
            {
                Title = "Магия Бали",
                Description = "Погружение в духовные практики на острове Богов.",
                Price = 1200,
                ImageUrl = "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80", 
                Location = "Бали, Индонезия",
                StartDate = DateTime.UtcNow.AddDays(30),
                Difficulty = 3,
                IsHit = true,
                SpotsAvailable = 5 
            },
            new Tour
            {
                Title = "Алтайская Тишина",
                Description = "Медитации в горах и перезагрузка сознания.",
                Price = 800,
                ImageUrl = "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
                Location = "Алтай, Россия",
                StartDate = DateTime.UtcNow.AddDays(45),
                Difficulty = 4,
                IsHit = false,
                SpotsAvailable = 10 
            },
            new Tour
            {
                Title = "Мальдивы Релакс",
                Description = "Йога на рассвете и океан спокойствия.",
                Price = 2500,
                ImageUrl = "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=800&q=80",
                Location = "Мальдивы",
                StartDate = DateTime.UtcNow.AddDays(60),
                Difficulty = 1, // Легко
                IsHit = true,
                SpotsAvailable = 2 
            },
            new Tour
            {
                Title = "Непал: Путь к Гималаям",
                Description = "Треккинг, утренние практики и философские лекции в горах.",
                Price = 1800,
                ImageUrl = "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=800&q=80",
                Location = "Катманду и Покхара, Непал",
                StartDate = DateTime.UtcNow.AddDays(75),
                Difficulty = 5,
                IsHit = false,
                SpotsAvailable = 8
            },
            new Tour
            {
                Title = "Турция: Йога и Детокс",
                Description = "Мягкая программа восстановления, море и авторское детокс-меню.",
                Price = 1400,
                ImageUrl = "https://images.unsplash.com/photo-1575722290270-626b0208df99?auto=format&fit=crop&w=800&q=80",
                Location = "Фетхие, Турция",
                StartDate = DateTime.UtcNow.AddDays(90),
                Difficulty = 2,
                IsHit = true,
                SpotsAvailable = 12
            }
        };

        var existingTourTitles = context.Tours
            .Select(t => t.Title)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        foreach (var tour in tours)
        {
            if (!existingTourTitles.Contains(tour.Title))
            {
                context.Tours.Add(tour);
            }
        }
        context.SaveChanges();

        // --- COURSES ---
        if (!context.Courses.Any())
        {
            var courses = new Course[]
            {
                new Course
                {
                    Title = "Йога-занятия",
                    Subtitle = "Освой основы за 30 дней",
                    Description = "Программа для тех, кто делает первые шаги. Разберем каждое движение.",
                    Content = "12 уроков, подробные видео, чек-листы.",
                    Price = 5000,
                    ImageUrl = "https://images.unsplash.com/photo-1544367563-12123d8959bd?auto=format&fit=crop&w=800&q=80",
                    Level = "Beginner",
                    DurationWeeks = 4
                },
                new Course
                {
                    Title = "Курс Медитации",
                    Subtitle = "Управление эмоциями и покой",
                    Description = "Техники дыхания и концентрации для снижения стресса.",
                    Content = "Ежедневные практики по 15 минут.",
                    Price = 4500,
                    ImageUrl = "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80",
                    Level = "All Levels",
                    DurationWeeks = 3
                }
            };

            foreach (var c in courses)
            {
                context.Courses.Add(c);
            }
            context.SaveChanges();
        }
    }

    private static void CleanupDeprecatedPrograms(YogaDbContext context)
    {
        var allCourses = context.Courses.ToList();
        var coursesToDelete = allCourses
            .Where(c =>
                (c.Title ?? string.Empty).Contains("здоров", StringComparison.OrdinalIgnoreCase) ||
                (c.Title ?? string.Empty).Contains("питани", StringComparison.OrdinalIgnoreCase) ||
                (c.Title ?? string.Empty).Contains("ментор", StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (coursesToDelete.Count > 0)
        {
            context.Courses.RemoveRange(coursesToDelete);
        }

        var allConsultations = context.Consultations.ToList();
        var consultationsToDelete = allConsultations
            .Where(c =>
                (c.Title ?? string.Empty).Contains("nutrition", StringComparison.OrdinalIgnoreCase) ||
                (c.Title ?? string.Empty).Contains("питани", StringComparison.OrdinalIgnoreCase) ||
                (c.Title ?? string.Empty).Contains("mentor", StringComparison.OrdinalIgnoreCase) ||
                (c.Title ?? string.Empty).Contains("ментор", StringComparison.OrdinalIgnoreCase))
            .ToList();

        if (consultationsToDelete.Count > 0)
        {
            context.Consultations.RemoveRange(consultationsToDelete);
        }

        var beginnerCourses = allCourses
            .Where(c => (c.Title ?? string.Empty).Contains("для начинающих", StringComparison.OrdinalIgnoreCase))
            .ToList();

        foreach (var course in beginnerCourses)
        {
            course.Title = "Йога-занятия";
            if (string.IsNullOrWhiteSpace(course.Subtitle))
            {
                course.Subtitle = "Освой основы за 30 дней";
            }
        }

        if (coursesToDelete.Count > 0 || consultationsToDelete.Count > 0 || beginnerCourses.Count > 0)
        {
            context.SaveChanges();
        }
    }
}

