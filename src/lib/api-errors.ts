/**
 * API Error Response Utilities
 * Standardized error handling for consistent API responses
 */

import { NextResponse } from "next/server";

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  statusCode: number;
  timestamp: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  timestamp: string;
}

/**
 * Standard error codes for consistent API responses
 */
export const API_ERRORS = {
  // Client errors (4xx)
  BAD_REQUEST: {
    status: 400,
    error: "Bad Request",
    message:
      "The request could not be understood or was missing required parameters.",
  },
  UNAUTHORIZED: {
    status: 401,
    error: "Unauthorized",
    message: "Authentication is required to access this resource.",
  },
  FORBIDDEN: {
    status: 403,
    error: "Forbidden",
    message: "You do not have permission to access this resource.",
  },
  NOT_FOUND: {
    status: 404,
    error: "Not Found",
    message: "The requested resource could not be found.",
  },
  CONFLICT: {
    status: 409,
    error: "Conflict",
    message: "The request conflicts with the current state of the server.",
  },
  VALIDATION_ERROR: {
    status: 422,
    error: "Validation Error",
    message: "The request data failed validation.",
  },
  RATE_LIMIT: {
    status: 429,
    error: "Too Many Requests",
    message: "Rate limit exceeded. Please try again later.",
  },

  // Server errors (5xx)
  INTERNAL_ERROR: {
    status: 500,
    error: "Internal Server Error",
    message: "An unexpected error occurred. Please try again later.",
  },
  DATABASE_ERROR: {
    status: 500,
    error: "Database Error",
    message: "A database error occurred. Please try again later.",
  },
  SERVICE_UNAVAILABLE: {
    status: 503,
    error: "Service Unavailable",
    message: "The service is temporarily unavailable. Please try again later.",
  },
} as const;

/**
 * Create a standardized error response
 */
export function errorResponse(
  errorType: keyof typeof API_ERRORS,
  customMessage?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  const error = API_ERRORS[errorType];

  const response: ApiErrorResponse = {
    error: error.error,
    message: customMessage || error.message,
    statusCode: error.status,
    timestamp: new Date().toISOString(),
  };

  if (details && process.env.NODE_ENV === "development") {
    response.details = details;
  }

  return NextResponse.json(response, { status: error.status });
}

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Handle Supabase errors with consistent responses
 */
export function handleSupabaseError(
  error: unknown,
  context?: string
): NextResponse<ApiErrorResponse> {
  console.error(`Supabase error${context ? ` in ${context}` : ""}:`, error);

  // Check if it's a Supabase error with code
  if (error && typeof error === "object" && "code" in error) {
    const supabaseError = error as { code: string; message: string };

    // Map common Supabase error codes to our error types
    switch (supabaseError.code) {
      case "PGRST116": // Not found
        return errorResponse("NOT_FOUND", supabaseError.message);
      case "23505": // Unique violation
        return errorResponse(
          "CONFLICT",
          "A record with this data already exists"
        );
      case "23503": // Foreign key violation
        return errorResponse(
          "BAD_REQUEST",
          "Invalid reference to related data"
        );
      case "42501": // Insufficient privilege
        return errorResponse("FORBIDDEN", "Insufficient permissions");
      default:
        return errorResponse(
          "DATABASE_ERROR",
          "A database error occurred",
          process.env.NODE_ENV === "development" ? error : undefined
        );
    }
  }

  // Generic database error
  return errorResponse(
    "DATABASE_ERROR",
    "A database error occurred",
    process.env.NODE_ENV === "development" ? error : undefined
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[]
):
  | { valid: true }
  | { valid: false; response: NextResponse<ApiErrorResponse> } {
  const missingFields = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length > 0) {
    return {
      valid: false,
      response: errorResponse(
        "VALIDATION_ERROR",
        `Missing required fields: ${missingFields.join(", ")}`
      ),
    };
  }

  return { valid: true };
}

/**
 * Handle authentication errors consistently
 */
export function authenticationError(
  message = "Authentication required"
): NextResponse<ApiErrorResponse> {
  return errorResponse("UNAUTHORIZED", message);
}

/**
 * Handle authorization errors consistently
 */
export function authorizationError(
  message = "You do not have permission to perform this action"
): NextResponse<ApiErrorResponse> {
  return errorResponse("FORBIDDEN", message);
}
