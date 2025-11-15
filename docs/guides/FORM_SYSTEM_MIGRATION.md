/**
 * Form System Migration Example
 * 
 * This file demonstrates how to migrate from manual form handling
 * to the new Form component system with validation and accessibility.
 * 
 * Example: GroupFormModal Migration
 */

// ============================================================================
// BEFORE - Manual Form Handling (OLD WAY)
// ============================================================================

/*
const GroupFormModalOld = () => {
  const [values, setValues] = useState({
    name: "",
    description: "",
    sport: "",
    color: "#ff6b35",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!values.name.trim()) {
      newErrors.name = "Group name is required";
    }

    if (!values.sport) {
      newErrors.sport = "Sport selection is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.createGroup(values);
      onSave();
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Group Name</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        {errors.name && <span>{errors.name}</span>}
      </div>

      <div>
        <label>Sport</label>
        <select
          value={values.sport}
          onChange={(e) => handleChange("sport", e.target.value)}
        >
          <option value="">Select sport...</option>
          <option value="Football">Football</option>
          <option value="Volleyball">Volleyball</option>
        </select>
        {errors.sport && <span>{errors.sport}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Group"}
      </button>
    </form>
  );
};
*/

// ============================================================================
// AFTER - New Form System (NEW WAY)
// ============================================================================

import { Form, FormField, FormSelect, FormSubmitButton } from "@/components/ui/Form";
import { validationRules } from "@/lib/form-validation";

const GroupFormModalNew = () => {
  const handleSubmit = async (values: Record<string, any>) => {
    await apiClient.createGroup(values);
    onSave();
    onClose();
  };

  return (
    <Form
      onSubmit={handleSubmit}
      initialValues={{
        name: "",
        description: "",
        sport: "",
        color: "#ff6b35",
      }}
      validation={{
        name: validationRules.required("Group name is required"),
        sport: validationRules.required("Sport selection is required"),
      }}
    >
      <FormField
        name="name"
        label="Group Name"
        placeholder="Enter group name..."
        fullWidth
        required
      />

      <FormSelect
        name="sport"
        label="Sport"
        options={[
          { value: "", label: "Select sport..." },
          { value: "Football", label: "Football" },
          { value: "Volleyball", label: "Volleyball" },
        ]}
        fullWidth
        required
      />

      <FormSubmitButton fullWidth>
        Create Group
      </FormSubmitButton>
    </Form>
  );
};

// ============================================================================
// BENEFITS OF NEW SYSTEM
// ============================================================================

/*
✅ LESS CODE
- 80+ lines reduced to ~40 lines
- No manual state management
- No manual error handling

✅ BETTER ACCESSIBILITY
- Automatic ARIA attributes (aria-invalid, aria-describedby)
- ARIA live region for error announcements
- Focus management on first error
- Screen reader friendly

✅ CONSISTENT VALIDATION
- Reusable validation rules
- Type-safe validation schema
- Async validation support
- Custom validators

✅ BETTER UX
- Validate on blur (configurable)
- Clear errors on type
- Loading states handled automatically
- Keyboard navigation built-in

✅ EASIER MAINTENANCE
- Single source of truth for validation
- Consistent error display
- Easier to test
- Less prone to bugs
*/

// ============================================================================
// ADVANCED FEATURES
// ============================================================================

// 1. ASYNC VALIDATION (Check if email exists)
import { asyncValidators } from "@/lib/form-validation";

const SignupFormExample = () => (
  <Form onSubmit={handleSignup}>
    <FormField
      name="email"
      label="Email"
      type="email"
      validation={{
        ...validationRules.email(),
        asyncValidation: asyncValidators.emailAvailability,
      }}
      required
    />
  </Form>
);

// 2. CUSTOM VALIDATION (Password confirmation)
const PasswordFormExample = () => (
  <Form onSubmit={handlePasswordChange}>
    <FormField
      name="password"
      label="Password"
      type="password"
      validation={validationRules.password(8, true)}
      required
    />
    <FormField
      name="confirmPassword"
      label="Confirm Password"
      type="password"
      validation={validationRules.confirmPassword()}
      required
    />
  </Form>
);

// 3. VALUE TRANSFORMERS (Auto-format input)
import { transformers } from "@/lib/form-validation";

const PhoneFormExample = () => (
  <Form onSubmit={handleSubmit}>
    <FormField
      name="phone"
      label="Phone Number"
      validation={validationRules.phone()}
      transformValue={transformers.phone}
    />
  </Form>
);

// 4. CONDITIONAL VALIDATION (Field depends on another)
const ConditionalFormExample = () => (
  <Form
    onSubmit={handleSubmit}
    validation={{
      requiresShipping: validationRules.required(),
      shippingAddress: {
        custom: (value, allValues) => {
          // Only require if shipping is selected
          if (allValues.requiresShipping && !value) {
            return "Shipping address is required";
          }
          return undefined;
        },
      },
    }}
  >
    <FormCheckbox name="requiresShipping" label="Requires Shipping" />
    <FormField name="shippingAddress" label="Shipping Address" />
  </Form>
);

// 5. FORM ERROR SUMMARY (Show all errors at once)
import { FormErrorSummary } from "@/components/ui/Form";

const ErrorSummaryExample = () => (
  <Form onSubmit={handleSubmit}>
    <FormErrorSummary />
    {/* Form fields */}
  </Form>
);

// ============================================================================
// MIGRATION CHECKLIST
// ============================================================================

/*
📋 MIGRATION STEPS:

1. Replace form state management:
   ❌ const [values, setValues] = useState({})
   ❌ const [errors, setErrors] = useState({})
   ✅ Use <Form> component

2. Replace manual validation:
   ❌ Manual validateForm() function
   ✅ Use validation prop with validationRules

3. Replace raw inputs:
   ❌ <input type="text" ... />
   ✅ <FormField name="..." />

4. Replace submit handling:
   ❌ Manual handleSubmit with try/catch
   ✅ Pass async function to onSubmit prop

5. Replace submit button:
   ❌ <button disabled={isSubmitting}>
   ✅ <FormSubmitButton>

6. Add accessibility:
   ✅ Automatic ARIA attributes
   ✅ Screen reader announcements
   ✅ Focus management

7. Test thoroughly:
   ✅ Keyboard navigation (Tab, Enter, Escape)
   ✅ Screen reader (VoiceOver/NVDA)
   ✅ Error states
   ✅ Validation logic
*/

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: Login Form
export const LoginFormExample = () => (
  <Form
    onSubmit={async (values) => {
      await signIn(values.email, values.password);
    }}
  >
    <FormField
      name="email"
      label="Email"
      type="email"
      validation={validationRules.email()}
      required
      fullWidth
    />
    <FormField
      name="password"
      label="Password"
      type="password"
      validation={validationRules.password(8, false)}
      required
      fullWidth
    />
    <FormSubmitButton fullWidth>Sign In</FormSubmitButton>
  </Form>
);

// Pattern 2: Edit Form (with initial values)
export const EditProfileExample = ({ user }: { user: User }) => (
  <Form
    onSubmit={async (values) => {
      await updateProfile(user.id, values);
    }}
    initialValues={{
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    }}
  >
    <FormField name="name" label="Name" required fullWidth />
    <FormField
      name="email"
      label="Email"
      type="email"
      validation={validationRules.email()}
      required
      fullWidth
    />
    <FormField
      name="phone"
      label="Phone (optional)"
      transformValue={transformers.phone}
      fullWidth
    />
    <FormSubmitButton fullWidth>Save Changes</FormSubmitButton>
  </Form>
);

// Pattern 3: Multi-field validation
export const DateRangeFormExample = () => (
  <Form
    onSubmit={handleSubmit}
    validation={{
      startDate: {
        ...validationRules.required("Start date is required"),
        ...validationRules.date(),
      },
      endDate: {
        ...validationRules.required("End date is required"),
        ...validationRules.date(),
        custom: (value, allValues) => {
          const start = new Date(allValues.startDate);
          const end = new Date(value);
          if (end < start) {
            return "End date must be after start date";
          }
          return undefined;
        },
      },
    }}
  >
    <FormField
      name="startDate"
      label="Start Date"
      type="date"
      required
    />
    <FormField
      name="endDate"
      label="End Date"
      type="date"
      required
    />
    <FormSubmitButton>Submit</FormSubmitButton>
  </Form>
);
