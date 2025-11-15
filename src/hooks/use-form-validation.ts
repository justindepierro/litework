/**
 * useFormValidationLegacy Hook (DEPRECATED - Use new Form system instead)
 * 
 * ⚠️ DEPRECATED: This hook is being replaced by the new Form component system.
 * For new forms, use: import { Form, FormField } from "@/components/ui/Form"
 * 
 * This is kept for backward compatibility with existing forms:
 * - GroupFormModal
 * - AthleteEditModal  
 * - IndividualAssignmentModal
 * 
 * Centralized form validation logic with reusable validation rules,
 * error state management, and form submission handling.
 * 
 * Features:
 * - Declarative validation rules
 * - Automatic error clearing on input change
 * - Field-level and form-level validation
 * - Async validation support
 * - Custom validators
 * - Type-safe with TypeScript generics
 * 
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleSubmit, isValid, isSubmitting } = 
 *   useFormValidationLegacy({
 *     initialValues: { email: '', password: '' },
 *     validationRules: {
 *       email: { required: true, email: true },
 *       password: { required: true, minLength: 8 }
 *     },
 *     onSubmit: async (values) => {
 *       await apiClient.login(values);
 *     }
 *   });
 * ```
 */

import { useState, useCallback, useMemo } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Validation rule types supported by the hook
 */
export interface ValidationRule {
  required?: boolean | string; // true or custom error message
  email?: boolean | string;
  minLength?: number | { value: number; message?: string };
  maxLength?: number | { value: number; message?: string };
  min?: number | { value: number; message?: string };
  max?: number | { value: number; message?: string };
  pattern?: RegExp | { value: RegExp; message?: string };
  custom?: (value: unknown, allValues: Record<string, unknown>) => string | undefined;
  asyncValidation?: (value: unknown, allValues: Record<string, unknown>) => Promise<string | undefined>;
}

/**
 * Validation rules for all form fields
 */
export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule;
};

/**
 * Form errors state
 */
export type FormErrors<T> = {
  [K in keyof T]?: string;
} & {
  submit?: string; // Form-level submit error
};

/**
 * Hook configuration options
 */
export interface UseFormValidationOptions<T> {
  initialValues: T;
  validationRules: ValidationRules<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean; // Default: false (only validate on blur/submit)
  validateOnBlur?: boolean; // Default: true
}

/**
 * Hook return value
 */
export interface UseFormValidationReturn<T> {
  values: T;
  errors: FormErrors<T>;
  touched: { [K in keyof T]?: boolean };
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T, value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: FormErrors<T>) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => Promise<boolean>;
  validateForm: () => Promise<boolean>;
}

// ============================================================================
// Built-in Validators
// ============================================================================

/**
 * Validate required fields
 */
const validateRequired = (value: unknown, message?: string): string | undefined => {
  const isEmpty = 
    value === undefined ||
    value === null ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0);
  
  return isEmpty ? (message || 'This field is required') : undefined;
};

/**
 * Validate email format
 */
const validateEmail = (value: string, message?: string): string | undefined => {
  if (!value) return undefined; // Skip if empty (use required for that)
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return !emailRegex.test(value) 
    ? (message || 'Invalid email format') 
    : undefined;
};

/**
 * Validate minimum length
 */
const validateMinLength = (value: string, min: number, message?: string): string | undefined => {
  if (!value) return undefined; // Skip if empty
  
  return value.length < min 
    ? (message || `Must be at least ${min} characters`) 
    : undefined;
};

/**
 * Validate maximum length
 */
const validateMaxLength = (value: string, max: number, message?: string): string | undefined => {
  if (!value) return undefined; // Skip if empty
  
  return value.length > max 
    ? (message || `Must be no more than ${max} characters`) 
    : undefined;
};

/**
 * Validate minimum value (numeric)
 */
const validateMin = (value: number, min: number, message?: string): string | undefined => {
  if (value === undefined || value === null) return undefined;
  
  return value < min 
    ? (message || `Must be at least ${min}`) 
    : undefined;
};

/**
 * Validate maximum value (numeric)
 */
const validateMax = (value: number, max: number, message?: string): string | undefined => {
  if (value === undefined || value === null) return undefined;
  
  return value > max 
    ? (message || `Must be no more than ${max}`) 
    : undefined;
};

/**
 * Validate pattern (regex)
 */
const validatePattern = (value: string, pattern: RegExp, message?: string): string | undefined => {
  if (!value) return undefined; // Skip if empty
  
  return !pattern.test(value) 
    ? (message || 'Invalid format') 
    : undefined;
};

// ============================================================================
// Main Hook (LEGACY)
// ============================================================================

/**
 * @deprecated Use new Form component system instead: import { Form, FormField } from "@/components/ui/Form"
 */
export function useFormValidationLegacy<T extends Record<string, unknown>>({
  initialValues,
  validationRules,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<{ [K in keyof T]?: boolean }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Validate a single field
   */
  const validateField = useCallback(async (field: keyof T): Promise<boolean> => {
    const value = values[field];
    const rules = validationRules[field];
    
    if (!rules) return true; // No rules = valid

    let error: string | undefined;

    // Required validation
    if (rules.required) {
      const message = typeof rules.required === 'string' ? rules.required : undefined;
      error = validateRequired(value, message);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Email validation
    if (rules.email && value) {
      const message = typeof rules.email === 'string' ? rules.email : undefined;
      error = validateEmail(String(value), message);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Min length validation
    if (rules.minLength) {
      const min = typeof rules.minLength === 'number' ? rules.minLength : rules.minLength.value;
      const message = typeof rules.minLength === 'object' ? rules.minLength.message : undefined;
      error = validateMinLength(String(value), min, message);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Max length validation
    if (rules.maxLength) {
      const max = typeof rules.maxLength === 'number' ? rules.maxLength : rules.maxLength.value;
      const message = typeof rules.maxLength === 'object' ? rules.maxLength.message : undefined;
      error = validateMaxLength(String(value), max, message);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Min value validation
    if (rules.min !== undefined) {
      const min = typeof rules.min === 'number' ? rules.min : rules.min.value;
      const message = typeof rules.min === 'object' ? rules.min.message : undefined;
      error = validateMin(parseFloat(String(value)), min, message);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Max value validation
    if (rules.max !== undefined) {
      const max = typeof rules.max === 'number' ? rules.max : rules.max.value;
      const message = typeof rules.max === 'object' ? rules.max.message : undefined;
      error = validateMax(parseFloat(String(value)), max, message);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Pattern validation
    if (rules.pattern) {
      const pattern = rules.pattern instanceof RegExp ? rules.pattern : rules.pattern.value;
      const message = typeof rules.pattern === 'object' && 'message' in rules.pattern ? rules.pattern.message : undefined;
      error = validatePattern(String(value), pattern, message);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Custom validation
    if (rules.custom) {
      error = rules.custom(value, values);
      if (error) {
        setErrorsState(prev => ({ ...prev, [field]: error }));
        return false;
      }
    }

    // Async validation
    if (rules.asyncValidation) {
      try {
        error = await rules.asyncValidation(value, values);
        if (error) {
          setErrorsState(prev => ({ ...prev, [field]: error }));
          return false;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Validation failed';
        setErrorsState(prev => ({ ...prev, [field]: errorMessage }));
        return false;
      }
    }

    // Clear error if all validations passed
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    
    return true;
  }, [values, validationRules]);

  /**
   * Validate all fields
   */
  const validateForm = useCallback(async (): Promise<boolean> => {
    const fields = Object.keys(validationRules) as (keyof T)[];
    const validationResults = await Promise.all(
      fields.map(field => validateField(field))
    );
    
    return validationResults.every(result => result === true);
  }, [validationRules, validateField]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Clear error on change
    if (errors[field]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Validate on change if enabled
    if (validateOnChange && touched[field]) {
      validateField(field);
    }
  }, [errors, touched, validateOnChange, validateField]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback((field: keyof T) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate on blur if enabled
    if (validateOnBlur) {
      validateField(field);
    }
  }, [validateOnBlur, validateField]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, field) => ({
      ...acc,
      [field]: true,
    }), {});
    setTouched(allTouched);

    // Validate all fields
    const isValid = await validateForm();
    
    if (!isValid) {
      return;
    }

    setIsSubmitting(true);
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors.submit;
      return newErrors;
    });

    try {
      await onSubmit(values);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred';
      setErrorsState(prev => ({ ...prev, submit: errorMessage }));
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validationRules, validateForm, onSubmit]);

  /**
   * Set field value directly
   */
  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Set field error directly
   */
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrorsState(prev => ({ ...prev, [field]: error }));
  }, []);

  /**
   * Set multiple values at once
   */
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  /**
   * Set multiple errors at once
   */
  const setErrors = useCallback((newErrors: FormErrors<T>) => {
    setErrorsState(newErrors);
  }, []);

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  /**
   * Compute if form is valid
   */
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    resetForm,
    validateField,
    validateForm,
  };
}
