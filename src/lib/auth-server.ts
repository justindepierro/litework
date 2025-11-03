/**
 * Server-Side Authentication Utilities
 * For use in API routes and server components
 * 
 * Uses Supabase cookie-based authentication (no Authorization headers needed)
 */

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from './supabase-admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'coach' | 'athlete';
  firstName: string;
  lastName: string;
  fullName: string;
}

export interface AuthResult {
  user: AuthUser | null;
  error: string | null;
}

/**
 * Get authenticated user from Supabase session cookies
 * This is the ONLY function you need for server-side auth
 * 
 * Usage in API routes:
 * ```ts
 * const { user, error } = await getAuthenticatedUser();
 * if (!user) {
 *   return NextResponse.json({ error }, { status: 401 });
 * }
 * // Use user.id, user.role, etc.
 * ```
 */
export async function getAuthenticatedUser(): Promise<AuthResult> {
  try {
    // Get Next.js cookie store
    const cookieStore = await cookies();
    
    // Create Supabase server client with cookie access
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    
    // Get authenticated user from session
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return {
        user: null,
        error: 'Authentication required',
      };
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !profile) {
      return {
        user: null,
        error: 'User profile not found',
      };
    }

    return {
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role as 'admin' | 'coach' | 'athlete',
        firstName: profile.first_name || profile.name?.split(' ')[0] || '',
        lastName: profile.last_name || profile.name?.split(' ')[1] || '',
        fullName: profile.name,
      },
      error: null,
    };
  } catch (error) {
    console.error('[AUTH_SERVER] Error getting authenticated user:', error);
    return {
      user: null,
      error: 'Authentication failed',
    };
  }
}

/**
 * Role hierarchy helper
 */
const ROLE_HIERARCHY = {
  admin: 3,
  coach: 2,
  athlete: 1,
};

/**
 * Check if user has required role or higher
 */
export function hasRoleOrHigher(
  user: AuthUser,
  requiredRole: 'admin' | 'coach' | 'athlete'
): boolean {
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser): boolean {
  return user.role === 'admin';
}

/**
 * Check if user is coach or admin
 */
export function isCoach(user: AuthUser): boolean {
  return user.role === 'coach' || user.role === 'admin';
}

/**
 * Check if user is athlete (any authenticated user)
 */
export function isAthlete(user: AuthUser): boolean {
  return user.role === 'athlete' || user.role === 'coach' || user.role === 'admin';
}

/**
 * Permission helpers
 */
export function canManageGroups(user: AuthUser): boolean {
  return isCoach(user);
}

export function canAssignWorkouts(user: AuthUser): boolean {
  return isCoach(user);
}

export function canViewAllAthletes(user: AuthUser): boolean {
  return isCoach(user);
}

export function canModifyWorkouts(user: AuthUser): boolean {
  return isCoach(user);
}

/**
 * Legacy support - for gradual migration
 * @deprecated Use getAuthenticatedUser() instead
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { user } = await getAuthenticatedUser();
  return user;
}

/**
 * @deprecated Use getAuthenticatedUser() with role check instead
 */
export async function requireAuth(): Promise<AuthUser> {
  const { user, error } = await getAuthenticatedUser();
  if (!user) {
    throw new Error(error || 'Unauthorized');
  }
  return user;
}

/**
 * @deprecated Use getAuthenticatedUser() with hasRoleOrHigher() instead
 */
export async function requireRole(
  role: 'admin' | 'coach' | 'athlete'
): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!hasRoleOrHigher(user, role)) {
    throw new Error('Forbidden');
  }
  
  return user;
}

/**
 * @deprecated Use getAuthenticatedUser() with isCoach() instead
 */
export async function requireCoach(): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!isCoach(user)) {
    throw new Error('Forbidden - Coach access required');
  }
  
  return user;
}

// Get admin Supabase client (bypasses RLS)
export function getAdminClient() {
  return supabaseAdmin;
}
