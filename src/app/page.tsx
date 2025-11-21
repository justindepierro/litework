import { cookies } from "next/headers";
import StaticHome from "./static-home";
import AuthenticatedHome from "./authenticated-home";

export default async function Home() {
  // Check if user is authenticated (server-side)
  const cookieStore = await cookies();
  const hasSession =
    cookieStore.has("sb-access-token") || cookieStore.has("sb-refresh-token");

  // If authenticated, show client page with full features
  // If not authenticated, show static server-rendered page (zero JS, 100% optimized)
  if (hasSession) {
    return <AuthenticatedHome />;
  }

  // Return static server-rendered page (100% performance optimized)
  return <StaticHome />;
}
