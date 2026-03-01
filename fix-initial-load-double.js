const fs = require('fs');

const files = [
  'src/app/consultations-mentorship/ConsultationsMentorshipClient.tsx',
  'src/app/courses-beginners/CoursesBeginnersClient.tsx',
  'src/app/courses-women/CoursesWomenClient.tsx',
  'src/app/courses-meditation/CoursesMeditationClient.tsx',
  'src/app/consultations-private/ConsultationsPrivateClient.tsx',
  'src/app/tours/ToursPageClient.tsx',
  'src/app/consultations-nutrition/ConsultationsNutritionClient.tsx',
  'src/app/courses-back/CoursesBackClient.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/if \(!initialData\) \{ setLoading\(true\); if \(!initialData\) \{ setLoading\(true\); loadProducts\(\); \} \}/g, 'if (!initialData) { setLoading(true); loadProducts(); }');
    fs.writeFileSync(file, content, 'utf8');
  }
});
