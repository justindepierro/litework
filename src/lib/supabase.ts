import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[SUPABASE] Missing environment variables!");
  console.error("[SUPABASE] URL:", supabaseUrl ? "SET" : "MISSING");
  console.error("[SUPABASE] KEY:", supabaseAnonKey ? "SET" : "MISSING");
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  cookies: {
    getAll() {
      if (typeof document === "undefined") return [];
      return document.cookie.split("; ").map((cookie) => {
        const [name, ...valueParts] = cookie.split("=");
        return {
          name,
          value: valueParts.join("="),
        };
      });
    },
    setAll(cookies) {
      if (typeof document === "undefined") return;
      cookies.forEach(({ name, value, options }) => {
        let cookie = `${name}=${value}; path=${options?.path || "/"}`;
        
        // Set max age - default to 7 days if not specified
        const maxAge = options?.maxAge || 604800; // 7 days in seconds
        cookie += `; max-age=${maxAge}`;
        
        if (options?.domain) cookie += `; domain=${options.domain}`;
        
        // Use Lax for better compatibility, falls back to Strict if specified
        const sameSite = options?.sameSite || "Lax";
        cookie += `; samesite=${sameSite}`;
        
        // Add secure flag in production (HTTPS)
        if (window.location.protocol === "https:") {
          cookie += "; secure";
        }
        
        document.cookie = cookie;
      });
    },
  },
  global: {
    headers: {
      "X-Client-Info": "litework-web",
    },
  },
  auth: {
    // Persist session across page reloads
    persistSession: true,
    // Auto refresh token before expiry
    autoRefreshToken: true,
    // Detect session from URL (for email confirmations, password resets)
    detectSessionInUrl: true,
    // Storage key for session
    storageKey: "litework-auth-token",
  },
});

// Database type definitions will be generated here later
export type Database = Record<string, unknown>;
