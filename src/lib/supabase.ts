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
        if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
        if (options?.domain) cookie += `; domain=${options.domain}`;
        if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
        document.cookie = cookie;
      });
    },
  },
  global: {
    headers: {
      "X-Client-Info": "litework-web",
    },
  },
});

// Database type definitions will be generated here later
export type Database = Record<string, unknown>;
