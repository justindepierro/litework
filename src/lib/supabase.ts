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
    get(name: string) {
      if (typeof document === "undefined") return undefined;
      const cookies = document.cookie.split("; ");
      const cookie = cookies.find((c) => c.startsWith(name + "="));
      return cookie?.split("=")[1];
    },
    set(name: string, value: string, options: any) {
      if (typeof document === "undefined") return;
      let cookie = `${name}=${value}; path=/`;
      if (options?.maxAge) cookie += `; max-age=${options.maxAge}`;
      if (options?.domain) cookie += `; domain=${options.domain}`;
      if (options?.path) cookie += `; path=${options.path}`;
      if (options?.sameSite) cookie += `; samesite=${options.sameSite}`;
      // Note: httpOnly cannot be set from JavaScript (must be server-side)
      document.cookie = cookie;
    },
    remove(name: string, options: any) {
      if (typeof document === "undefined") return;
      let cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      if (options?.domain) cookie += `; domain=${options.domain}`;
      if (options?.path) cookie += `; path=${options.path}`;
      document.cookie = cookie;
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
