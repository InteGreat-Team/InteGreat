import { createClient } from '@supabase/supabase-js';
import { env } from './env';

// Extract the Supabase URL and key from the validated environment variables
const supabaseUrl = env.SUPABASE_URL;
const supabaseKey = env.SUPABASE_KEY;

// Create a Supabase client using the extracted URL and key
export const supabase = createClient(supabaseUrl, supabaseKey);