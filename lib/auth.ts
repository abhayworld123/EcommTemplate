import { createServerClient } from './supabase-server';
import { createClient } from './supabase-client';

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  created_at?: string;
}

/**
 * Get the current authenticated user on the server
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const role = (user.user_metadata?.role as UserRole) || 'user';
    
    return {
      id: user.id,
      email: user.email || '',
      role,
      name: user.user_metadata?.name || user.user_metadata?.full_name,
      created_at: user.created_at,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Check if the current user is an admin (server-side)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user?.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Get the current authenticated user on the client
 */
export async function getCurrentUserClient() {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const role = (user.user_metadata?.role as UserRole) || 'user';
    
    return {
      id: user.id,
      email: user.email || '',
      role,
      name: user.user_metadata?.name || user.user_metadata?.full_name,
      created_at: user.created_at,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Require admin access - throws error if not admin
 */
export async function requireAdmin() {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

