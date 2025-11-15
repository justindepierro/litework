/**
 * Enhanced Profile Page
 * Complete profile management with avatar, metrics, and settings
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { useRequireAuth } from "@/hooks/use-auth-guard";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ToastProvider";
import ConfirmModal from "@/components/ConfirmModal";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";
import { Select } from "@/components/ui/Select";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";
import { Body, Label, Caption } from "@/components/ui/Typography";
import {
  User,
  Save,
  Lock,
  Mail,
  Calendar,
  Ruler,
  Scale,
  Activity,
  Upload,
  X,
  Camera,
  Phone,
  AlertCircle,
} from "lucide-react";

interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  heightInches?: number;
  weightLbs?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  bio?: string;
  injuryStatus?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  age?: number;
  bmi?: number;
  bmiCategory?: string;
}

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const toast = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Add minimum loading time for smooth skeleton display
  const isLoading = authLoading || isLoadingProfile;
  const { showSkeleton } = useMinimumLoadingTime(isLoading, 300);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [gender, setGender] = useState<string>("");
  const [bio, setBio] = useState("");
  const [injuryStatus, setInjuryStatus] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");

  // Avatar state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"profile" | "metrics" | "account">(
    "profile"
  );
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Load profile data
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setIsLoadingProfile(true);
      const response = await fetch("/api/profile");
      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
        setFirstName(data.profile.firstName || "");
        setLastName(data.profile.lastName || "");
        setPhoneNumber(data.profile.phoneNumber || "");
        setDateOfBirth(data.profile.dateOfBirth || "");

        // Convert total inches to feet and inches
        if (data.profile.heightInches) {
          const totalInches = data.profile.heightInches;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round((totalInches % 12) * 10) / 10; // Round to 1 decimal
          setHeightFeet(feet.toString());
          setHeightInches(inches.toString());
        } else {
          setHeightFeet("");
          setHeightInches("");
        }

        setWeightLbs(data.profile.weightLbs?.toString() || "");
        setGender(data.profile.gender || "");
        setBio(data.profile.bio || "");
        setInjuryStatus(data.profile.injuryStatus || "");
        setEmergencyName(data.profile.emergencyContactName || "");
        setEmergencyPhone(data.profile.emergencyContactPhone || "");
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Failed to load profile data");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("File too large. Maximum size is 2MB.");
        return;
      }

      if (
        !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
          file.type
        )
      ) {
        setError(
          "Invalid file type. Only JPG, PNG, WebP, and GIF are allowed."
        );
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    try {
      setIsUploadingAvatar(true);
      setError("");

      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Profile picture updated!");
        setProfile((prev) =>
          prev ? { ...prev, avatarUrl: data.avatarUrl } : null
        );
        setAvatarFile(null);
        setAvatarPreview(null);
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to upload avatar");
      }
    } catch (err) {
      setError("Failed to upload profile picture");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarDelete = async () => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Profile Picture",
      message: "Are you sure you want to remove your profile picture?",
      onConfirm: async () => {
        try {
          setIsUploadingAvatar(true);
          setError("");
          setConfirmModal({ ...confirmModal, isOpen: false });

          const response = await fetch("/api/profile/avatar", {
            method: "DELETE",
          });

          const data = await response.json();

          if (data.success) {
            toast.success("Profile picture removed");
            setProfile((prev) =>
              prev ? { ...prev, avatarUrl: undefined } : null
            );
          } else {
            toast.error(data.error || "Failed to delete avatar");
          }
        } catch (err) {
          toast.error("Failed to delete profile picture");
        } finally {
          setIsUploadingAvatar(false);
        }
      },
    });
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const updates: Record<string, string | number> = {
        firstName: firstName,
        lastName: lastName,
      };

      if (activeTab === "profile") {
        updates.phoneNumber = phoneNumber;
        updates.bio = bio;
        updates.injuryStatus = injuryStatus;
        updates.emergencyContactName = emergencyName;
        updates.emergencyContactPhone = emergencyPhone;
      }

      if (activeTab === "metrics") {
        if (dateOfBirth) updates.dateOfBirth = dateOfBirth;

        // Convert feet and inches to total inches
        if (heightFeet || heightInches) {
          const feet = parseFloat(heightFeet) || 0;
          const inches = parseFloat(heightInches) || 0;
          updates.heightInches = feet * 12 + inches;
        }

        if (weightLbs) updates.weightLbs = parseFloat(weightLbs);
        if (gender) updates.gender = gender;
      }

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setProfile(data.profile);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setSuccess("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to change password"
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const calculateHeightDisplay = (inches: number) => {
    const feet = Math.floor(inches / 12);
    const remainingInches = Math.round(inches % 12);
    return `${feet}'${remainingInches}"`;
  };

  if (showSkeleton) {
    return (
      <main className="min-h-screen bg-(--bg-secondary) pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-(--bg-secondary) pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <PageHeader
            title="Profile Settings"
            subtitle="Manage your account and personal information"
            icon={<User className="w-6 h-6" />}
            gradientVariant="tertiary"
          />
        </div>

        {/* Success/Error Messages */}
        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Profile Picture Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Profile Picture
          </h2>

          <div className="flex items-center gap-6">
            {/* Avatar Display */}
            <div className="relative">
              {avatarPreview || profile?.avatarUrl ? (
                <img
                  src={avatarPreview || profile?.avatarUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-(--bg-tertiary) flex items-center justify-center">
                  <User className="w-16 h-16 text-(--text-tertiary)" />
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarSelect}
                className="hidden"
              />

              {avatarPreview ? (
                <div className="space-y-2">
                  <Body className="text-sm" variant="secondary">
                    New picture selected. Click upload to save.
                  </Body>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="px-4 py-2 bg-(--accent-blue-600) text-white rounded-lg hover:bg-(--accent-blue-700) disabled:opacity-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingAvatar ? "Uploading..." : "Upload"}
                    </button>
                    <button
                      onClick={() => {
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className="px-4 py-2 bg-(--bg-tertiary) text-(--text-secondary) rounded-lg hover:bg-(--interactive-hover)"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Body className="text-sm" variant="secondary">
                    JPG, PNG, WebP, or GIF. Max 2MB.
                  </Body>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-(--accent-blue-600) text-white rounded-lg hover:bg-(--accent-blue-700) flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Choose Photo
                    </button>
                    {profile?.avatarUrl && (
                      <button
                        onClick={handleAvatarDelete}
                        disabled={isUploadingAvatar}
                        className="px-4 py-2 bg-(--status-error-light) text-(--status-error) rounded-lg hover:bg-(--status-error-light) disabled:opacity-50 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "profile"
                  ? "border-b-2 border-(--accent-blue-600) text-(--accent-blue-600) bg-(--accent-blue-50)"
                  : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--interactive-hover)"
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Personal Info
            </button>
            <button
              onClick={() => setActiveTab("metrics")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "metrics"
                  ? "border-b-2 border-(--accent-blue-600) text-(--accent-blue-600) bg-(--accent-blue-50)"
                  : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--interactive-hover)"
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Physical Metrics
            </button>
            <button
              onClick={() => setActiveTab("account")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === "account"
                  ? "border-b-2 border-(--accent-blue-600) text-(--accent-blue-600) bg-(--accent-blue-50)"
                  : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--interactive-hover)"
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Account Security
            </button>
          </div>

          <div className="p-6">
            {/* Personal Info Tab */}
            {activeTab === "profile" && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Basic Information Section */}
                <div>
                  <h3 className="text-lg font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-(--accent-blue-600)" />
                    Basic Information
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FloatingLabelInput
                        type="text"
                        label="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        fullWidth
                      />

                      <FloatingLabelInput
                        type="text"
                        label="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        fullWidth
                      />
                    </div>

                    <FloatingLabelInput
                      type="email"
                      label="Email"
                      value={profile?.email || ""}
                      disabled
                      leftIcon={<Mail className="w-5 h-5" />}
                      helperText="Contact support to change your email"
                      fullWidth
                    />

                    <FloatingLabelInput
                      type="tel"
                      label="Phone Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      leftIcon={<Phone className="w-5 h-5" />}
                      helperText="Your personal phone number"
                      fullWidth
                    />
                  </div>
                </div>

                {/* About Section */}
                <div className="pt-6">
                  <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
                    About You
                  </h3>

                  <div className="space-y-4">
                    <FloatingLabelTextarea
                      label="Bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      helperText="Tell us about yourself, your fitness goals, experience level, etc."
                      fullWidth
                    />

                    <div className="bg-(--accent-amber-50) rounded-lg p-4">
                      <Label className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4" />
                        Current Injury Status
                      </Label>
                      <FloatingLabelTextarea
                        label="Injury Status"
                        value={injuryStatus}
                        onChange={(e) => setInjuryStatus(e.target.value)}
                        rows={2}
                        helperText="List any current injuries, limitations, or areas to avoid during training"
                        fullWidth
                      />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="pt-6">
                  <h3 className="text-lg font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-(--status-error)" />
                    Emergency Contact
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FloatingLabelInput
                      type="text"
                      label="Emergency Contact Name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      fullWidth
                    />

                    <FloatingLabelInput
                      type="tel"
                      label="Emergency Contact Phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      fullWidth
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {/* Physical Metrics Tab */}
            {activeTab === "metrics" && (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Personal Details Section */}
                <div>
                  <h3 className="text-lg font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-(--accent-blue-600)" />
                    Personal Details
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FloatingLabelInput
                        type="date"
                        label="Date of Birth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        helperText={
                          profile?.age
                            ? `Current age: ${profile.age} years`
                            : ""
                        }
                        fullWidth
                      />
                    </div>

                    <Select
                      label="Gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      options={[
                        { value: "", label: "Select gender" },
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                        { value: "other", label: "Other" },
                        {
                          value: "prefer_not_to_say",
                          label: "Prefer not to say",
                        },
                      ]}
                      fullWidth
                    />
                  </div>
                </div>

                {/* Physical Measurements Section */}
                <div className="pt-6">
                  <h3 className="text-lg font-semibold text-(--text-primary) mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-(--status-success)" />
                    Physical Measurements
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4" />
                        Height
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <FloatingLabelInput
                          type="number"
                          min="3"
                          max="8"
                          label="Feet"
                          value={heightFeet}
                          onChange={(e) => setHeightFeet(e.target.value)}
                          fullWidth
                        />
                        <FloatingLabelInput
                          type="number"
                          step="0.5"
                          min="0"
                          max="11.5"
                          label="Inches"
                          value={heightInches}
                          onChange={(e) => setHeightInches(e.target.value)}
                          fullWidth
                        />
                      </div>
                      {(heightFeet || heightInches) && (
                        <Caption variant="default" className="mt-1">
                          Total:{" "}
                          {(
                            (parseFloat(heightFeet) || 0) * 12 +
                            (parseFloat(heightInches) || 0)
                          ).toFixed(1)}{" "}
                          inches
                        </Caption>
                      )}
                    </div>

                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <Scale className="w-4 h-4" />
                        Weight (lbs)
                      </Label>
                      <FloatingLabelInput
                        type="number"
                        step="0.1"
                        min="50"
                        max="500"
                        label="Weight in lbs"
                        value={weightLbs}
                        onChange={(e) => setWeightLbs(e.target.value)}
                        fullWidth
                      />
                    </div>
                  </div>

                  {/* BMI Display */}
                  {profile?.bmi && (
                    <div className="bg-gradient-to-r from-(--accent-blue-50) to-cyan-50 rounded-lg p-4 mt-6">
                      <h4 className="font-semibold text-(--text-primary) mb-2">
                        Body Mass Index (BMI)
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-bold text-(--accent-blue-600)">
                          {profile.bmi}
                        </span>
                        <span className="px-3 py-1 bg-white text-(--accent-blue-700) rounded-full text-sm font-medium capitalize">
                          {profile.bmiCategory}
                        </span>
                      </div>
                      <Caption variant="default" className="mt-2">
                        BMI is a general indicator and may not reflect athletic
                        body composition.
                      </Caption>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-8 py-3 bg-gradient-to-r from-(--status-success) to-(--status-success) text-white rounded-lg hover:from-(--status-success) hover:to-(--status-success) disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? "Saving..." : "Save Metrics"}
                  </button>
                </div>
              </form>
            )}

            {/* Account Security Tab */}
            {activeTab === "account" && (
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-(--text-primary) mb-4">
                    Change Password
                  </h3>
                  <Body className="text-sm mb-4" variant="secondary">
                    Use a strong password with at least 6 characters.
                  </Body>
                </div>

                <FloatingLabelInput
                  type="password"
                  label="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                  fullWidth
                />

                <FloatingLabelInput
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                  fullWidth
                />

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full md:w-auto px-6 py-3 bg-(--accent-blue-600) text-white rounded-lg hover:bg-(--accent-blue-700) disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  {isChangingPassword
                    ? "Changing Password..."
                    : "Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        confirmVariant="danger"
      />
    </main>
  );
}
