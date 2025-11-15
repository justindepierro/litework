/**
 * Form Validation Utilities
 * 
 * Common validation functions and patterns for forms.
 * Use with the Form component system.
 */

import { ValidationRule } from "@/components/ui/Form";

// ============================================================================
// COMMON VALIDATION RULES
// ============================================================================

export const validationRules = {
  /** Required field validation */
  required: (message = "This field is required"): ValidationRule => ({
    required: message,
  }),

  /** Email validation */
  email: (message = "Please enter a valid email address"): ValidationRule => ({
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message,
    },
  }),

  /** Password validation (min 8 chars, with strength requirements) */
  password: (
    minLength = 8,
    requireStrength = true
  ): ValidationRule => {
    const rules: ValidationRule = {
      required: "Password is required",
      minLength: {
        value: minLength,
        message: `Password must be at least ${minLength} characters`,
      },
    };

    if (requireStrength) {
      rules.custom = (value: string) => {
        if (!value) return undefined;
        
        // Check for at least one uppercase letter
        if (!/[A-Z]/.test(value)) {
          return "Password must contain at least one uppercase letter";
        }
        
        // Check for at least one lowercase letter
        if (!/[a-z]/.test(value)) {
          return "Password must contain at least one lowercase letter";
        }
        
        // Check for at least one number
        if (!/[0-9]/.test(value)) {
          return "Password must contain at least one number";
        }
        
        return undefined;
      };
    }

    return rules;
  },

  /** Confirm password validation (must match password field) */
  confirmPassword: (
    passwordFieldName = "password",
    message = "Passwords do not match"
  ): ValidationRule => ({
    required: "Please confirm your password",
    custom: (value, allValues) => {
      if (value !== allValues[passwordFieldName]) {
        return message;
      }
      return undefined;
    },
  }),

  /** Minimum length validation */
  minLength: (
    length: number,
    message?: string
  ): ValidationRule => ({
    minLength: {
      value: length,
      message: message || `Must be at least ${length} characters`,
    },
  }),

  /** Maximum length validation */
  maxLength: (
    length: number,
    message?: string
  ): ValidationRule => ({
    maxLength: {
      value: length,
      message: message || `Must be no more than ${length} characters`,
    },
  }),

  /** Numeric value validation */
  numeric: (message = "Please enter a valid number"): ValidationRule => ({
    pattern: {
      value: /^[0-9]+$/,
      message,
    },
  }),

  /** Phone number validation (US format) */
  phone: (message = "Please enter a valid phone number"): ValidationRule => ({
    pattern: {
      value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
      message,
    },
  }),

  /** URL validation */
  url: (message = "Please enter a valid URL"): ValidationRule => ({
    pattern: {
      value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
      message,
    },
  }),

  /** Min value validation (for numbers) */
  min: (
    value: number,
    message?: string
  ): ValidationRule => ({
    min: {
      value,
      message: message || `Value must be at least ${value}`,
    },
  }),

  /** Max value validation (for numbers) */
  max: (
    value: number,
    message?: string
  ): ValidationRule => ({
    max: {
      value,
      message: message || `Value must be no more than ${value}`,
    },
  }),

  /** Range validation (for numbers) */
  range: (
    min: number,
    max: number,
    message?: string
  ): ValidationRule => ({
    min: {
      value: min,
      message: message || `Value must be between ${min} and ${max}`,
    },
    max: {
      value: max,
      message: message || `Value must be between ${min} and ${max}`,
    },
  }),

  /** Date validation (must be valid date) */
  date: (message = "Please enter a valid date"): ValidationRule => ({
    custom: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return message;
      }
      return undefined;
    },
  }),

  /** Future date validation */
  futureDate: (message = "Date must be in the future"): ValidationRule => ({
    custom: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      const now = new Date();
      if (date <= now) {
        return message;
      }
      return undefined;
    },
  }),

  /** Past date validation */
  pastDate: (message = "Date must be in the past"): ValidationRule => ({
    custom: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      const now = new Date();
      if (date >= now) {
        return message;
      }
      return undefined;
    },
  }),
};

// ============================================================================
// COMPOSITE VALIDATION RULES
// ============================================================================

/**
 * Combine multiple validation rules into one
 */
export const combineValidations = (
  ...rules: ValidationRule[]
): ValidationRule => {
  const combined: ValidationRule = {};

  for (const rule of rules) {
    Object.assign(combined, rule);

    // Combine custom validators
    if (rule.custom) {
      const existingCustom = combined.custom;
      combined.custom = (value, allValues) => {
        if (existingCustom) {
          const error = existingCustom(value, allValues);
          if (error) return error;
        }
        return rule.custom!(value, allValues);
      };
    }

    // Combine async validators
    if (rule.asyncValidation) {
      const existingAsync = combined.asyncValidation;
      combined.asyncValidation = async (value) => {
        if (existingAsync) {
          const error = await existingAsync(value);
          if (error) return error;
        }
        return rule.asyncValidation!(value);
      };
    }
  }

  return combined;
};

// ============================================================================
// VALUE TRANSFORMERS
// ============================================================================

export const transformers = {
  /** Trim whitespace */
  trim: (value: string) => value.trim(),

  /** Convert to lowercase */
  lowercase: (value: string) => value.toLowerCase(),

  /** Convert to uppercase */
  uppercase: (value: string) => value.toUpperCase(),

  /** Remove non-numeric characters */
  numeric: (value: string) => value.replace(/[^0-9]/g, ""),

  /** Format phone number */
  phone: (value: string) => {
    const digits = value.replace(/[^0-9]/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  },

  /** Format currency */
  currency: (value: string) => {
    const numeric = value.replace(/[^0-9.]/g, "");
    const parts = numeric.split(".");
    if (parts.length > 2) return parts[0] + "." + parts[1];
    return numeric;
  },
};

// ============================================================================
// ASYNC VALIDATORS
// ============================================================================

/**
 * Check if email is already registered
 */
export const asyncValidators = {
  emailAvailability: async (email: string): Promise<string | undefined> => {
    try {
      const response = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!data.available) {
        return "This email is already registered";
      }
      return undefined;
    } catch (error) {
      console.error("Email check failed:", error);
      return undefined;
    }
  },

  /**
   * Check if username is available
   */
  usernameAvailability: async (username: string): Promise<string | undefined> => {
    if (!username || username.length < 3) return undefined;
    
    try {
      const response = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await response.json();
      if (!data.available) {
        return "This username is already taken";
      }
      return undefined;
    } catch (error) {
      console.error("Username check failed:", error);
      return undefined;
    }
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate form data against a validation schema
 */
export const validateFormData = (
  data: Record<string, any>,
  schema: Record<string, ValidationRule>
): Record<string, string> => {
  const errors: Record<string, string> = {};

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Required validation
    if (rules.required) {
      const isEmpty =
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0);

      if (isEmpty) {
        errors[field] =
          typeof rules.required === "string"
            ? rules.required
            : "This field is required";
        continue;
      }
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) continue;

    // Min length
    if (rules.minLength && typeof value === "string") {
      if (value.length < rules.minLength.value) {
        errors[field] = rules.minLength.message;
        continue;
      }
    }

    // Max length
    if (rules.maxLength && typeof value === "string") {
      if (value.length > rules.maxLength.value) {
        errors[field] = rules.maxLength.message;
        continue;
      }
    }

    // Pattern
    if (rules.pattern && typeof value === "string") {
      if (!rules.pattern.value.test(value)) {
        errors[field] = rules.pattern.message;
        continue;
      }
    }

    // Custom validation
    if (rules.custom) {
      const error = rules.custom(value, data);
      if (error) {
        errors[field] = error;
        continue;
      }
    }
  }

  return errors;
};

/**
 * Check if form has errors
 */
export const hasFormErrors = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error message
 */
export const getFirstError = (errors: Record<string, string>): string | null => {
  const keys = Object.keys(errors);
  return keys.length > 0 ? errors[keys[0]] : null;
};
