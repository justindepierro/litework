"use client";

import React from "react";
import {
  User,
  Calendar,
  Phone,
  AlertCircle,
  Ruler,
  Weight,
} from "lucide-react";
import { useFormValidationLegacy } from "@/hooks/use-form-validation";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
  ModalFooter,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  FloatingLabelInput,
  FloatingLabelTextarea,
} from "@/components/ui/FloatingLabelInput";
import { Select } from "@/components/ui/Select";
import { Heading, Body } from "@/components/ui/Typography";
import type { User as UserType } from "@/types";

interface AthleteEditModalProps {
  athlete: UserType & {
    bio?: string | null;
    phone?: string | null;
    emergencyContact?: string | null;
    emergencyPhone?: string | null;
    heightInches?: number | null;
    weightLbs?: number | null;
    gender?: string | null;
  };
  onClose: () => void;
  onSuccess: () => void;
}

const AthleteEditModal: React.FC<AthleteEditModalProps> = ({
  athlete,
  onClose,
  onSuccess,
}) => {
  const { values, errors, handleChange, handleSubmit, isSubmitting } =
    useFormValidationLegacy({
      initialValues: {
        firstName: athlete.firstName || "",
        lastName: athlete.lastName || "",
        email: athlete.email || "",
        dateOfBirth: athlete.dateOfBirth
          ? new Date(athlete.dateOfBirth).toISOString().split("T")[0]
          : "",
        injuryStatus: athlete.injuryStatus || "",
        bio: athlete.bio || "",
        phone: athlete.phone || "",
        emergencyContact: athlete.emergencyContact || "",
        emergencyPhone: athlete.emergencyPhone || "",
        heightInches: athlete.heightInches?.toString() || "",
        weightLbs: athlete.weightLbs?.toString() || "",
        gender: athlete.gender || "",
      },
      validationRules: {
        firstName: { required: "First name is required" },
        lastName: { required: "Last name is required" },
        email: {
          required: "Email is required",
          email: "Invalid email format",
        },
      },
      onSubmit: async (formValues) => {
        // Construct name from first and last name
        const name = `${formValues.firstName.trim()} ${formValues.lastName.trim()}`;

        const response = await fetch(`/api/users/${athlete.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email: formValues.email,
            dateOfBirth: formValues.dateOfBirth || null,
            injuryStatus: formValues.injuryStatus || null,
            bio: formValues.bio || null,
            phone: formValues.phone || null,
            emergencyContact: formValues.emergencyContact || null,
            emergencyPhone: formValues.emergencyPhone || null,
            heightInches: formValues.heightInches
              ? parseFloat(formValues.heightInches)
              : null,
            weightLbs: formValues.weightLbs
              ? parseFloat(formValues.weightLbs)
              : null,
            gender: formValues.gender || null,
          }),
        });

        const result = await response.json();

        if (result.success) {
          onSuccess();
        } else {
          throw new Error(result.error || "Failed to update athlete");
        }
      },
    });

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader
          title="Edit Athlete Profile"
          subtitle={`Update information for ${athlete.firstName} ${athlete.lastName}`}
          onClose={onClose}
          icon={<User className="w-6 h-6 text-primary" />}
        />

        <ModalContent className="overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="First Name"
                value={values.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={errors.firstName}
                required
                leftIcon={<User className="w-4 h-4" />}
                fullWidth
              />
              <FloatingLabelInput
                label="Last Name"
                value={values.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={errors.lastName}
                required
                leftIcon={<User className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <Heading level="h3" className="text-sm uppercase tracking-wide">
                Contact Information
              </Heading>
              <FloatingLabelInput
                label="Email"
                type="email"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                required
                leftIcon={<User className="w-4 h-4" />}
                fullWidth
              />
              <FloatingLabelInput
                label="Phone"
                type="tel"
                value={values.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <Heading level="h3" className="text-sm uppercase tracking-wide">
                Emergency Contact
              </Heading>
              <FloatingLabelInput
                label="Emergency Contact Name"
                value={values.emergencyContact}
                onChange={(e) =>
                  handleChange("emergencyContact", e.target.value)
                }
                leftIcon={<AlertCircle className="w-4 h-4" />}
                fullWidth
              />
              <FloatingLabelInput
                label="Emergency Contact Phone"
                type="tel"
                value={values.emergencyPhone}
                onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Physical Information */}
            <div className="space-y-4">
              <Heading level="h3" className="text-sm uppercase tracking-wide">
                Physical Information
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingLabelInput
                  label="Height (inches)"
                  type="number"
                  value={values.heightInches}
                  onChange={(e) => handleChange("heightInches", e.target.value)}
                  leftIcon={<Ruler className="w-4 h-4" />}
                  fullWidth
                />
                <FloatingLabelInput
                  label="Weight (lbs)"
                  type="number"
                  value={values.weightLbs}
                  onChange={(e) => handleChange("weightLbs", e.target.value)}
                  leftIcon={<Weight className="w-4 h-4" />}
                  fullWidth
                />
                <Select
                  label="Gender"
                  value={values.gender}
                  onChange={(e) => handleChange("gender", e.target.value)}
                  options={[
                    { value: "", label: "Select gender" },
                    { value: "male", label: "Male" },
                    { value: "female", label: "Female" },
                    { value: "other", label: "Other" },
                    { value: "prefer_not_to_say", label: "Prefer not to say" },
                  ]}
                />
              </div>
              <FloatingLabelInput
                label="Date of Birth"
                type="date"
                value={values.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Injury Status */}
            <div className="space-y-4">
              <Heading level="h3" className="text-sm uppercase tracking-wide">
                Health Status
              </Heading>
              <FloatingLabelInput
                label="Injury Status"
                value={values.injuryStatus}
                onChange={(e) => handleChange("injuryStatus", e.target.value)}
                leftIcon={<AlertCircle className="w-4 h-4" />}
                helperText="Leave blank if no current injuries"
                fullWidth
              />
            </div>

            {/* Bio */}
            <div className="space-y-4">
              <Heading level="h3" className="text-sm uppercase tracking-wide">
                About
              </Heading>
              <FloatingLabelTextarea
                label="Bio"
                value={values.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                fullWidth
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-lg bg-error-light border border-error p-4">
                <Body size="sm" className="text-error">
                  {errors.submit}
                </Body>
              </div>
            )}
          </div>
        </ModalContent>

        <ModalFooter>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
};

export default AthleteEditModal;
