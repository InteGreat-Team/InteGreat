import { neon } from '@neondatabase/serverless';

const neonDbUrl = process.env.NEON_DB_URL;

// Debug logging
console.log('Neon DB URL available:', !!neonDbUrl);
if (!neonDbUrl) {
  console.warn('NEON_DB_URL environment variable is not set');
}

// Only initialize the client if we have a URL
export const neonDb = neonDbUrl ? neon(neonDbUrl) : null; 