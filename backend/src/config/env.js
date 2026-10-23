import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  API_PREFIX: process.env.API_PREFIX || '/api',

  // Supabase
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',

  // Auth
  JWT_SECRET: process.env.JWT_SECRET || 'gramsetu_production_jwt_secret_dev_techtrix26_key_98374',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',

  // Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',

  // Platform
  DEMO_MODE: process.env.DEMO_MODE !== 'false',
  ENABLE_DEMO_RESET: process.env.ENABLE_DEMO_RESET !== 'false',
  MAX_UPLOAD_SIZE_MB: parseInt(process.env.MAX_UPLOAD_SIZE_MB || '10', 10),
  GEO_DISCREPANCY_THRESHOLD_KM: parseFloat(process.env.GEO_DISCREPANCY_THRESHOLD_KM || '28'),

  isProduction: process.env.NODE_ENV === 'production',
  isSupabaseConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
};
