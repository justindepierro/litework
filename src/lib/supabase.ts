import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("[SUPABASE] Missing environment variables!");
  console.error("[SUPABASE] URL:", supabaseUrl ? "SET" : "MISSING");
  console.error("[SUPABASE] KEY:", supabaseAnonKey ? "SET" : "MISSING");
} else {
  // [REMOVED] console.log("[SUPABASE] Client initialized with URL:", supabaseUrl);
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session across page reloads
    persistSession: true,
    // Auto refresh token before expiry (30 seconds before expiration)
    autoRefreshToken: true,
    // Detect session from URL (for email confirmations, password resets)
    detectSessionInUrl: true,
    // Use PKCE flow for enhanced security
    flowType: "pkce",
    // Storage key for session
    storageKey: "litework-auth-token",
    // Use localStorage for better mobile PWA persistence
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    // Set debug mode to see what's happening with auth
    debug: process.env.NODE_ENV === "development",
  },
  global: {
    headers: {
      "x-client-info": "litework-web@1.0.0",
    },
  },
  db: {
    schema: "public",
  },
  cookies: {
    getAll() {
      if (typeof document === "undefined") return [];
      const cookies = document.cookie.split("; ").map((cookie) => {
        const [name, ...valueParts] = cookie.split("=");
        return {
          name,
          value: valueParts.join("="),
        };
      });
      // [REMOVED] console.log("[SUPABASE] getAll cookies:", cookies.length);
      return cookies;
    },
    setAll(cookies) {
      if (typeof document === "undefined") return;
      // [REMOVED] console.log("[SUPABASE] setAll cookies:", cookies.length);
      cookies.forEach(({ name, value, options }) => {
        let cookie = `${name}=${value}; path=${options?.path || "/"}`;

        // Set max age - 30 days for mobile app persistence
        const maxAge = options?.maxAge || 2592000; // 30 days in seconds
        cookie += `; max-age=${maxAge}`;

        if (options?.domain) cookie += `; domain=${options.domain}`;

        // Use Lax for better compatibility with mobile PWAs
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
});

// Database type definitions will be generated here later
export type Database = Record<string, unknown>;
