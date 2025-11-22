import { useState, useCallback } from "react";

/**
 * Custom hook for managing form state with validation errors
 *
 * Replaces the common pattern of:
 * - const [formData, setFormData] = useState(initialState)
 * - const [errors, setErrors] = useState({})
 * - const [isDirty, setIsDirty] = useState(false)
 *
 * @template T - The type of the form data object
 * @param initialState - Initial form data values
 * @returns Form state and helper functions
 *
 * @example
 * ```typescript
 * const { formData, errors, isDirty, handleChange, setErrors, reset } = useFormState({
 *   name: '',
 *   email: '',
 * });
 *
 * <Input
 *   value={formData.name}
 *   onChange={(e) => handleChange('name', e.target.value)}
 *   error={errors.name}
 * />
 * ```
 */
export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState<T>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  /**
   * Update a single field in the form
   * Automatically clears any existing error for that field
   * Marks form as dirty
   */
  const handleChange = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);

      // Clear error for this field when user starts typing
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field as string];
          return newErrors;
        });
      }
    },
    [errors]
  );

  /**
   * Update multiple fields at once
   * Useful for batch updates or resetting specific fields
   */
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  /**
   * Reset form to initial state
   * Clears all errors and dirty flag
   */
  const reset = useCallback(() => {
    setFormData(initialState);
    setErrors({});
    setIsDirty(false);
  }, [initialState]);

  /**
   * Reset form to a new state
   * Useful when editing different items
   */
  const resetTo = useCallback((newState: T) => {
    setFormData(newState);
    setErrors({});
    setIsDirty(false);
  }, []);

  // Set a single error message
  const setFieldError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => ({ ...prev, [field as string]: message }));
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  // Check if form has any errors
  const hasErrors = Object.keys(errors).length > 0;

  return {
    formData,
    errors,
    isDirty,
    hasErrors,
    handleChange,
    updateFields,
    setErrors,
    setFieldError,
    clearErrors,
    reset,
    resetTo,
  };
}
