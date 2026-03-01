const fs = require('fs');
const glob = require('glob'); // Not sure if glob is installed, maybe use fs.readdirSync recursively.

// Let's just use the exact files from grep
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

    // Replace `const [loading, setLoading] = useState(true);` with `useState(!initialData)`
    content = content.replace(
      /const \[loading, setLoading\] = useState\(true\);/g,
      'const [loading, setLoading] = useState(!initialData);'
    );

    // Remove `isInitialLoad` declaration
    content = content.replace(
      /const \[isInitialLoad,\s*setIsInitialLoad\] = useState\(true\);\r?\n?/g,
      ''
    );

    // Remove `if (isInitialLoad) { setIsInitialLoad(false); return; }`
    content = content.replace(
      /if \(isInitialLoad\)\s*\{\s*setIsInitialLoad\(false\);\s*return;\s*\}\r?\n?/g,
      ''
    );

    // Add conditional fetch in useEffect
    content = content.replace(
      /loadProducts\(\);/g,
      'if (!initialData) { setLoading(true); loadProducts(); }'
    );

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
