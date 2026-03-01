const { execSync } = require('child_process');

try {
  console.log('Running Prisma generate for Vercel...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to generate Prisma client:', error);
  process.exit(1);
}
