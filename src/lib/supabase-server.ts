import { supabaseAdmin } from "./supabase-admin";

// Helper to get admin client for server-side API routes
export function createClient() {
  return supabaseAdmin;
}
