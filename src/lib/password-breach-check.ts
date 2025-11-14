/**
 * Password Breach Checker
 * Uses HaveIBeenPwned API to check if a password has appeared in known data breaches
 * Uses k-Anonymity model - only sends first 5 chars of SHA-1 hash
 */

import crypto from "crypto";

/**
 * Check if a password has been compromised in a data breach
 * @param password The password to check
 * @returns Promise<{ breached: boolean; count?: number; error?: string }>
 */
export async function checkPasswordBreach(password: string): Promise<{
  breached: boolean;
  count?: number;
  error?: string;
}> {
  try {
    // SHA-1 hash the password
    const hash = crypto
      .createHash("sha1")
      .update(password)
      .digest("hex")
      .toUpperCase();

    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    // Check against HIBP API (k-Anonymity model - only sends first 5 chars)
    const response = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      {
        headers: {
          "User-Agent": "LiteWork-PasswordChecker",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `[PASSWORD_BREACH] API error: ${response.status} ${response.statusText}`
      );
      return {
        breached: false,
        error: "Unable to check password breach status",
      };
    }

    const data = await response.text();

    // Parse the response - format is "SUFFIX:COUNT\r\n"
    const lines = data.split("\r\n");
    for (const line of lines) {
      const [hashSuffix, countStr] = line.split(":");
      if (hashSuffix === suffix) {
        const count = parseInt(countStr, 10);
        console.warn(
          `[PASSWORD_BREACH] Password found in ${count} data breaches`
        );
        return {
          breached: true,
          count,
        };
      }
    }

    // Password not found in breaches
    return { breached: false };
  } catch (error) {
    console.error("[PASSWORD_BREACH] Error checking password:", error);
    return {
      breached: false,
      error:
        "Unable to check password breach status due to network error",
    };
  }
}

/**
 * Check password breach and return user-friendly message
 */
export async function getPasswordBreachMessage(
  password: string
): Promise<string | null> {
  const result = await checkPasswordBreach(password);

  if (result.error) {
    // Don't block signup on API errors
    console.warn(
      `[PASSWORD_BREACH] Skipping check due to error: ${result.error}`
    );
    return null;
  }

  if (result.breached) {
    if (result.count && result.count > 10000) {
      return `This password has been found in ${result.count.toLocaleString()} data breaches and is extremely common. Please choose a different password.`;
    } else if (result.count && result.count > 1000) {
      return `This password has been compromised in ${result.count.toLocaleString()} data breaches. Please choose a different password.`;
    } else {
      return "This password has been found in known data breaches. Please choose a different password for better security.";
    }
  }

  return null; // Password is safe
}
