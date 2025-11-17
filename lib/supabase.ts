// Re-export client functions for backward compatibility
// Note: Server functions should import directly from './supabase-server' 
// to avoid importing 'next/headers' in client components
export { createClient, supabase } from './supabase-client';

