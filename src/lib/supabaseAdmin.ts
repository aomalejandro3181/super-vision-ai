import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const serviceRoleKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

// Este cliente corre ÚNICAMENTE en el servidor (Astro API Routes)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);