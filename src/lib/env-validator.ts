/**
 * Environment Variable Validation
 *
 * Validates all required environment variables at startup.
 * Prevents runtime errors from missing configuration.
 */

interface EnvironmentConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;

  // App
  NODE_ENV: "development" | "production" | "test";
  NEXT_PUBLIC_APP_URL?: string;

  // Optional features
  NEXT_PUBLIC_ENABLE_PWA?: string;
  NEXT_PUBLIC_ENABLE_ANALYTICS?: string;
}

class EnvironmentValidator {
  private errors: string[] = [];
  private warnings: string[] = [];

  /**
   * Validate all required environment variables
   */
  validate(): void {
    this.validateRequired();
    this.validateOptional();
    this.reportResults();
  }

  private validateRequired(): void {
    const required = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];

    for (const key of required) {
      const value = process.env[key];
      if (!value || value.trim() === "") {
        this.errors.push(`Missing required environment variable: ${key}`);
      }
    }

    // Validate Supabase URL format
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl && !supabaseUrl.includes("supabase.co")) {
      this.warnings.push(
        "NEXT_PUBLIC_SUPABASE_URL doesn't look like a valid Supabase URL"
      );
    }
  }

  private validateOptional(): void {
    // Check for production URL in production
    if (
      process.env.NODE_ENV === "production" &&
      !process.env.NEXT_PUBLIC_APP_URL
    ) {
      this.warnings.push(
        "NEXT_PUBLIC_APP_URL not set - recommended for production"
      );
    }
  }

  private reportResults(): void {
    if (this.errors.length > 0) {
      console.error("\n❌ Environment Validation Failed:\n");
      this.errors.forEach((error) => console.error(`  - ${error}`));
      console.error(
        "\nPlease check your .env.local file and ensure all required variables are set.\n"
      );

      if (process.env.NODE_ENV === "production") {
        throw new Error("Missing required environment variables");
      }
    }

    if (this.warnings.length > 0 && process.env.NODE_ENV === "development") {
      console.warn("\n⚠️  Environment Warnings:\n");
      this.warnings.forEach((warning) => console.warn(`  - ${warning}`));
      console.warn("");
    }

    if (this.errors.length === 0 && process.env.NODE_ENV === "development") {
      // [REMOVED] console.log("✅ Environment variables validated successfully\n");
    }
  }

  /**
   * Get typed environment config
   */
  getConfig(): EnvironmentConfig {
    return {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY!,
      NODE_ENV:
        (process.env.NODE_ENV as "development" | "production" | "test") ||
        "development",
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA,
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
    };
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  }

  /**
   * Check if running in development
   */
  isDevelopment(): boolean {
    return process.env.NODE_ENV === "development";
  }
}

// Create singleton instance
const envValidator = new EnvironmentValidator();

// Validate on import (startup)
if (typeof window === "undefined") {
  // Only validate on server-side
  envValidator.validate();
}

export { envValidator };
export default envValidator;
