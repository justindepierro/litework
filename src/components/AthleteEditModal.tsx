"use client";

import React, { useState } from "react";
import {
  User,
  Calendar,
  Phone,
  AlertCircle,
  Ruler,
  Weight,
} from "lucide-react";
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
  const [formData, setFormData] = useState({
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Construct name from first and last name
      const name = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      const response = await fetch(`/api/users/${athlete.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: formData.email,
          dateOfBirth: formData.dateOfBirth || null,
          injuryStatus: formData.injuryStatus || null,
          bio: formData.bio || null,
          phone: formData.phone || null,
          emergencyContact: formData.emergencyContact || null,
          emergencyPhone: formData.emergencyPhone || null,
          heightInches: formData.heightInches
            ? parseFloat(formData.heightInches)
            : null,
          weightLbs: formData.weightLbs ? parseFloat(formData.weightLbs) : null,
          gender: formData.gender || null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
      } else {
        throw new Error(result.error || "Failed to update athlete");
      }
    } catch (error) {
      console.error("Error updating athlete:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to update athlete. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                error={errors.firstName}
                required
                leftIcon={<User className="w-4 h-4" />}
                fullWidth
              />
              <FloatingLabelInput
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                error={errors.lastName}
                required
                leftIcon={<User className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Contact Information
              </h3>
              <FloatingLabelInput
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                error={errors.email}
                required
                leftIcon={<User className="w-4 h-4" />}
                fullWidth
              />
              <FloatingLabelInput
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Emergency Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Emergency Contact
              </h3>
              <FloatingLabelInput
                label="Emergency Contact Name"
                value={formData.emergencyContact}
                onChange={(e) =>
                  handleChange("emergencyContact", e.target.value)
                }
                leftIcon={<AlertCircle className="w-4 h-4" />}
                fullWidth
              />
              <FloatingLabelInput
                label="Emergency Contact Phone"
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => handleChange("emergencyPhone", e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Physical Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Physical Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FloatingLabelInput
                  label="Height (inches)"
                  type="number"
                  value={formData.heightInches}
                  onChange={(e) => handleChange("heightInches", e.target.value)}
                  leftIcon={<Ruler className="w-4 h-4" />}
                  fullWidth
                />
                <FloatingLabelInput
                  label="Weight (lbs)"
                  type="number"
                  value={formData.weightLbs}
                  onChange={(e) => handleChange("weightLbs", e.target.value)}
                  leftIcon={<Weight className="w-4 h-4" />}
                  fullWidth
                />
                <Select
                  label="Gender"
                  value={formData.gender}
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
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                leftIcon={<Calendar className="w-4 h-4" />}
                fullWidth
              />
            </div>

            {/* Injury Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                Health Status
              </h3>
              <FloatingLabelInput
                label="Injury Status"
                value={formData.injuryStatus}
                onChange={(e) => handleChange("injuryStatus", e.target.value)}
                leftIcon={<AlertCircle className="w-4 h-4" />}
                helperText="Leave blank if no current injuries"
                fullWidth
              />
            </div>

            {/* Bio */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                About
              </h3>
              <FloatingLabelTextarea
                label="Bio"
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
                fullWidth
              />
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
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
