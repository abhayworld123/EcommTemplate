/**
 * Script to set admin role for a user
 * 
 * Usage:
 * 1. Get the user's email or ID from Supabase dashboard
 * 2. Run this script with: npx tsx scripts/set-admin-role.ts <user-email>
 * 
 * Or manually in Supabase SQL Editor:
 * UPDATE auth.users 
 * SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
 * WHERE email = 'user@example.com';
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.error('You can find this in your Supabase project settings > API');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setAdminRole(email: string) {
  try {
    // Get user by email
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      throw fetchError;
    }

    const user = users.users.find((u) => u.email === email);

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update user metadata
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        role: 'admin',
      },
    });

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully set admin role for ${email}`);
    console.log(`User ID: ${user.id}`);
  } catch (error) {
    console.error('Error setting admin role:', error);
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error('Usage: npx tsx scripts/set-admin-role.ts <user-email>');
  process.exit(1);
}

setAdminRole(email);

