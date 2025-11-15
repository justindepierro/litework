/**
 * Form Component System
 * 
 * Provides comprehensive form handling with:
 * - Validation context and error aggregation
 * - Accessibility with ARIA live regions
 * - Field-level and form-level validation
 * - Submit handling with loading states
 * - Keyboard navigation support
 * 
 * Usage:
 * ```tsx
 * <Form onSubmit={handleSubmit} validation={validationSchema}>
 *   <FormField name="email" label="Email" type="email" required />
 *   <FormField name="password" label="Password" type="password" required />
 *   <FormSubmitButton>Sign In</FormSubmitButton>
 * </Form>
 * ```
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useId,
} from "react";
import { Button } from "./Button";
import { Input, Textarea, InputProps, TextareaProps } from "./Input";
import { Select, SelectProps } from "./Select";
import { Checkbox, CheckboxProps } from "./Checkbox";
import { Caption } from "./Typography";

// ============================================================================
// TYPES
// ============================================================================

export interface ValidationRule {
  required?: boolean | string;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  custom?: (value: any, allValues: Record<string, any>) => string | undefined;
  asyncValidation?: (
    value: any
  ) => Promise<string | undefined>;
}

export interface ValidationSchema {
  [fieldName: string]: ValidationRule;
}

export interface FormContextValue {
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValidating: boolean;
  setValue: (name: string, value: any) => void;
  setError: (name: string, error: string) => void;
  clearError: (name: string) => void;
  setTouched: (name: string) => void;
  validateField: (name: string) => Promise<boolean>;
  registerField: (name: string, validation?: ValidationRule) => void;
  unregisterField: (name: string) => void;
}

const FormContext = createContext<FormContextValue | null>(null);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("Form components must be used within a <Form> component");
  }
  return context;
};

// ============================================================================
// FORM COMPONENT
// ============================================================================

export interface FormProps {
  children: React.ReactNode;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  initialValues?: Record<string, any>;
  validation?: ValidationSchema;
  onChange?: (values: Record<string, any>) => void;
  /** Show all errors on mount (useful for edit forms) */
  validateOnMount?: boolean;
  /** Validate fields on blur */
  validateOnBlur?: boolean;
  /** Validate fields on change */
  validateOnChange?: boolean;
  /** Custom class name */
  className?: string;
}

export const Form: React.FC<FormProps> = ({
  children,
  onSubmit,
  initialValues = {},
  validation = {},
  onChange,
  validateOnMount = false,
  validateOnBlur = true,
  validateOnChange = false,
  className = "",
}) => {
  const [values, setValues] = useState<Record<string, any>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fieldRegistry = useRef<Map<string, ValidationRule>>(new Map());
  const formId = useId();

  // Register field with validation rules
  const registerField = useCallback(
    (name: string, fieldValidation?: ValidationRule) => {
      const rules = fieldValidation || validation[name];
      if (rules) {
        fieldRegistry.current.set(name, rules);
      }
    },
    [validation]
  );

  // Unregister field
  const unregisterField = useCallback((name: string) => {
    fieldRegistry.current.delete(name);
  }, []);

  // Validate a single field
  const validateField = useCallback(
    async (name: string): Promise<boolean> => {
      const value = values[name];
      const rules = fieldRegistry.current.get(name) || validation[name];

      if (!rules) return true;

      // Required validation
      if (rules.required) {
        const isEmpty =
          value === undefined ||
          value === null ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (isEmpty) {
          const message =
            typeof rules.required === "string"
              ? rules.required
              : "This field is required";
          setErrors((prev) => ({ ...prev, [name]: message }));
          return false;
        }
      }

      // Min length validation
      if (rules.minLength && typeof value === "string") {
        if (value.length < rules.minLength.value) {
          setErrors((prev) => ({ ...prev, [name]: rules.minLength!.message }));
          return false;
        }
      }

      // Max length validation
      if (rules.maxLength && typeof value === "string") {
        if (value.length > rules.maxLength.value) {
          setErrors((prev) => ({ ...prev, [name]: rules.maxLength!.message }));
          return false;
        }
      }

      // Pattern validation
      if (rules.pattern && typeof value === "string") {
        if (!rules.pattern.value.test(value)) {
          setErrors((prev) => ({ ...prev, [name]: rules.pattern!.message }));
          return false;
        }
      }

      // Min value validation
      if (rules.min && typeof value === "number") {
        if (value < rules.min.value) {
          setErrors((prev) => ({ ...prev, [name]: rules.min!.message }));
          return false;
        }
      }

      // Max value validation
      if (rules.max && typeof value === "number") {
        if (value > rules.max.value) {
          setErrors((prev) => ({ ...prev, [name]: rules.max!.message }));
          return false;
        }
      }

      // Custom validation
      if (rules.custom) {
        const error = rules.custom(value, values);
        if (error) {
          setErrors((prev) => ({ ...prev, [name]: error }));
          return false;
        }
      }

      // Async validation
      if (rules.asyncValidation) {
        setIsValidating(true);
        try {
          const error = await rules.asyncValidation(value);
          if (error) {
            setErrors((prev) => ({ ...prev, [name]: error }));
            return false;
          }
        } finally {
          setIsValidating(false);
        }
      }

      // Clear error if validation passed
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });

      return true;
    },
    [values, validation]
  );

  // Set field value
  const setValue = useCallback(
    (name: string, value: any) => {
      const newValues = { ...values, [name]: value };
      setValues(newValues);
      onChange?.(newValues);

      // Validate on change if enabled
      if (validateOnChange && touched[name]) {
        validateField(name);
      }
    },
    [values, onChange, validateOnChange, touched, validateField]
  );

  // Set field error
  const setError = useCallback((name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  // Clear field error
  const clearError = useCallback((name: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  }, []);

  // Mark field as touched
  const setTouched = useCallback(
    (name: string) => {
      setTouchedState((prev) => ({ ...prev, [name]: true }));

      // Validate on blur if enabled
      if (validateOnBlur) {
        validateField(name);
      }
    },
    [validateOnBlur, validateField]
  );

  // Validate all fields
  const validateAllFields = useCallback(async (): Promise<boolean> => {
    const fieldNames = Array.from(fieldRegistry.current.keys());
    const validationResults = await Promise.all(
      fieldNames.map((name) => validateField(name))
    );
    return validationResults.every((isValid) => isValid);
  }, [validateField]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = Array.from(fieldRegistry.current.keys());
    setTouchedState(
      allFields.reduce(
        (acc, field) => ({ ...acc, [field]: true }),
        {}
      )
    );

    // Validate all fields
    const isValid = await validateAllFields();

    if (!isValid) {
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(
          `${formId}-${firstErrorField}`
        );
        element?.focus();
      }
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contextValue: FormContextValue = {
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    setValue,
    setError,
    clearError,
    setTouched,
    validateField,
    registerField,
    unregisterField,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {/* ARIA live region for error announcements */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {Object.keys(errors).length > 0 && (
            <span>
              Form has {Object.keys(errors).length} error
              {Object.keys(errors).length === 1 ? "" : "s"}
            </span>
          )}
        </div>
        {children}
      </form>
    </FormContext.Provider>
  );
};

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

export interface FormFieldProps
  extends Omit<InputProps, "value" | "onChange" | "error"> {
  /** Field name (used as key in form values) */
  name: string;
  /** Field validation rules */
  validation?: ValidationRule;
  /** Transform value before setting (e.g., trim, lowercase) */
  transformValue?: (value: any) => any;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, validation, transformValue, ...inputProps }, ref) => {
    const formContext = useFormContext();
    const fieldId = useId();

    // Register field on mount
    React.useEffect(() => {
      formContext.registerField(name, validation);
      return () => formContext.unregisterField(name);
    }, [name, validation, formContext]);

    const value = formContext.values[name] ?? "";
    const error = formContext.touched[name] ? formContext.errors[name] : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let newValue = e.target.value;
      if (transformValue) {
        newValue = transformValue(newValue);
      }
      formContext.setValue(name, newValue);
    };

    const handleBlur = () => {
      formContext.setTouched(name);
    };

    return (
      <Input
        {...inputProps}
        ref={ref}
        id={fieldId}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    );
  }
);

FormField.displayName = "FormField";

// ============================================================================
// FORM TEXTAREA COMPONENT
// ============================================================================

export interface FormTextareaProps
  extends Omit<TextareaProps, "value" | "onChange" | "error"> {
  name: string;
  validation?: ValidationRule;
  transformValue?: (value: any) => any;
}

export const FormTextarea = React.forwardRef<
  HTMLTextAreaElement,
  FormTextareaProps
>(({ name, validation, transformValue, ...textareaProps }, ref) => {
  const formContext = useFormContext();
  const fieldId = useId();

  React.useEffect(() => {
    formContext.registerField(name, validation);
    return () => formContext.unregisterField(name);
  }, [name, validation, formContext]);

  const value = formContext.values[name] ?? "";
  const error = formContext.touched[name] ? formContext.errors[name] : undefined;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value;
    if (transformValue) {
      newValue = transformValue(newValue);
    }
    formContext.setValue(name, newValue);
  };

  const handleBlur = () => {
    formContext.setTouched(name);
  };

  return (
    <Textarea
      {...textareaProps}
      ref={ref}
      id={fieldId}
      name={name}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error}
      aria-invalid={!!error}
      aria-describedby={error ? `${fieldId}-error` : undefined}
    />
  );
});

FormTextarea.displayName = "FormTextarea";

// ============================================================================
// FORM SELECT COMPONENT
// ============================================================================

export interface FormSelectProps
  extends Omit<SelectProps, "value" | "onChange" | "error"> {
  name: string;
  validation?: ValidationRule;
}

export const FormSelect = React.forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ name, validation, ...selectProps }, ref) => {
    const formContext = useFormContext();
    const fieldId = useId();

    React.useEffect(() => {
      formContext.registerField(name, validation);
      return () => formContext.unregisterField(name);
    }, [name, validation, formContext]);

    const value = formContext.values[name] ?? "";
    const error = formContext.touched[name] ? formContext.errors[name] : undefined;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      formContext.setValue(name, e.target.value);
    };

    const handleBlur = () => {
      formContext.setTouched(name);
    };

    return (
      <Select
        {...selectProps}
        ref={ref}
        id={fieldId}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        error={error}
        aria-invalid={!!error}
        aria-describedby={error ? `${fieldId}-error` : undefined}
      />
    );
  }
);

FormSelect.displayName = "FormSelect";

// ============================================================================
// FORM CHECKBOX COMPONENT
// ============================================================================

export interface FormCheckboxProps
  extends Omit<CheckboxProps, "checked" | "onChange"> {
  name: string;
  validation?: ValidationRule;
}

export const FormCheckbox = React.forwardRef<
  HTMLInputElement,
  FormCheckboxProps
>(({ name, validation, ...checkboxProps }, ref) => {
  const formContext = useFormContext();

  React.useEffect(() => {
    formContext.registerField(name, validation);
    return () => formContext.unregisterField(name);
  }, [name, validation, formContext]);

  const checked = formContext.values[name] ?? false;

  const handleChange = (newChecked: boolean) => {
    formContext.setValue(name, newChecked);
  };

  return (
    <Checkbox
      {...checkboxProps}
      ref={ref}
      checked={checked}
      onChange={handleChange}
    />
  );
});

FormCheckbox.displayName = "FormCheckbox";

// ============================================================================
// FORM SUBMIT BUTTON
// ============================================================================

export interface FormSubmitButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost" | "success";
  fullWidth?: boolean;
  loadingText?: string;
  disabled?: boolean;
  className?: string;
}

export const FormSubmitButton: React.FC<FormSubmitButtonProps> = ({
  children,
  variant = "primary",
  fullWidth = false,
  loadingText = "Submitting...",
  disabled = false,
  className = "",
}) => {
  const formContext = useFormContext();
  const hasErrors = Object.keys(formContext.errors).length > 0;

  return (
    <Button
      type="submit"
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled || formContext.isSubmitting || hasErrors}
      className={className}
    >
      {formContext.isSubmitting ? loadingText : children}
    </Button>
  );
};

// ============================================================================
// FORM ERROR SUMMARY
// ============================================================================

export interface FormErrorSummaryProps {
  title?: string;
  className?: string;
}

export const FormErrorSummary: React.FC<FormErrorSummaryProps> = ({
  title = "Please fix the following errors:",
  className = "",
}) => {
  const formContext = useFormContext();
  const errorEntries = Object.entries(formContext.errors);

  if (errorEntries.length === 0) return null;

  return (
    <div
      className={`bg-(--status-error-light) border border-(--status-error) rounded-[var(--radius-md)] p-4 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <Caption variant="default" className="font-[var(--font-weight-semibold)] mb-2">
        {title}
      </Caption>
      <ul className="list-disc list-inside space-y-1">
        {errorEntries.map(([field, error]) => (
          <li key={field}>
            <Caption variant="default">{error}</Caption>
          </li>
        ))}
      </ul>
    </div>
  );
};
