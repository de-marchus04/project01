import { OpenAPI } from './core/OpenAPI';

// When running in browser, proxy requests through Next.js server to avoid CORS/port issues
if (typeof window !== 'undefined') {
  OpenAPI.BASE = ''; // Relative path will use current origin (e.g. localhost:3000) matched by proxy
} else {
  // During SSR, we need the full URL
  OpenAPI.BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5253';
}
