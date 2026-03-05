function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  DATABASE_URL: requiredEnv('DATABASE_URL'),
  AUTH_SECRET: requiredEnv('AUTH_SECRET'),
  // Optional with defaults
  RESEND_API_KEY: process.env.RESEND_API_KEY || '',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  SEED_SECRET: process.env.SEED_SECRET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;
