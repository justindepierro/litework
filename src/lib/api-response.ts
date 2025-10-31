// Standardized API Response Utilities
// Consistent API response format across all routes

import { NextResponse } from "next/server";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | object;
  message?: string;
  timestamp: string;
  requestId?: string;
}

interface CreateApiResponseOptions {
  status?: number;
  headers?: Record<string, string>;
  requestId?: string;
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  options: CreateApiResponseOptions = {}
): NextResponse<ApiResponse<T>> {
  const { status = 200, headers, requestId } = options;

  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// Error response helper
export function createErrorResponse(
  error: string | object,
  message?: string,
  options: CreateApiResponseOptions = {}
): NextResponse<ApiResponse<null>> {
  const { status = 400, headers, requestId } = options;

  const response: ApiResponse<null> = {
    success: false,
    data: null,
    error,
    message,
    timestamp: new Date().toISOString(),
    requestId,
  };

  return NextResponse.json(response, {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

// Specific error response types
export function createNotFoundResponse(
  resource: string = "Resource",
  requestId?: string
): NextResponse<ApiResponse<null>> {
  return createErrorResponse(
    `${resource} not found`,
    "The requested resource could not be found",
    { status: 404, requestId }
  );
}

export function createUnauthorizedResponse(
  message: string = "Authentication required",
  requestId?: string
): NextResponse<ApiResponse<null>> {
  return createErrorResponse("Unauthorized", message, {
    status: 401,
    requestId,
  });
}

export function createForbiddenResponse(
  message: string = "Insufficient permissions",
  requestId?: string
): NextResponse<ApiResponse<null>> {
  return createErrorResponse("Forbidden", message, { status: 403, requestId });
}

export function createValidationErrorResponse(
  errors: Record<string, string[]> | string,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  return createErrorResponse(errors, "Validation failed", {
    status: 422,
    requestId,
  });
}

export function createInternalServerErrorResponse(
  error?: string | Error,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  // Log the actual error for debugging
  if (error instanceof Error) {
    console.error("Internal Server Error:", error.message, error.stack);
  } else if (error) {
    console.error("Internal Server Error:", error);
  }

  // Don't expose internal error details in production
  const publicError =
    process.env.NODE_ENV === "development"
      ? error instanceof Error
        ? error.message
        : error
      : "An unexpected error occurred";

  return createErrorResponse(
    publicError || "Internal server error",
    "Something went wrong on our end",
    { status: 500, requestId }
  );
}

// Rate limiting response
export function createRateLimitResponse(
  retryAfter?: number,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  const headers: Record<string, string> = {};
  if (retryAfter) {
    headers["Retry-After"] = retryAfter.toString();
  }

  return createErrorResponse(
    "Rate limit exceeded",
    "Too many requests. Please try again later.",
    { status: 429, headers, requestId }
  );
}

// Helper to wrap async API handlers with consistent error handling
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("API Handler Error:", error);

      // Generate a simple request ID for tracking
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      return createInternalServerErrorResponse(
        error instanceof Error ? error : undefined,
        requestId
      );
    }
  };
}

// Validation helpers
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): Record<string, string[]> | null {
  const errors: Record<string, string[]> = {};

  for (const field of requiredFields) {
    if (
      !data[field] ||
      (typeof data[field] === "string" && !data[field].trim())
    ) {
      errors[field] = [`${field} is required`];
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateStringLength(
  value: string,
  min: number,
  max: number
): boolean {
  return value.length >= min && value.length <= max;
}
