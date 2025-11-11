"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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
import { AthleteGroup } from "@/types";

export interface InviteForm {
  firstName: string;
  lastName: string;
  email: string;
  groupId?: string;
  notes?: string;
}

interface InviteAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (invite: InviteForm) => Promise<void>;
  groups: AthleteGroup[];
  onCreateNewGroup?: () => void;
}

export default function InviteAthleteModal({
  isOpen,
  onClose,
  onInvite,
  groups,
  onCreateNewGroup,
}: InviteAthleteModalProps) {
  const [form, setForm] = useState<InviteForm>({
    firstName: "",
    lastName: "",
    email: "",
    groupId: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName) return;

    setIsSubmitting(true);
    try {
      await onInvite(form);
      // Reset form on success
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        groupId: "",
        notes: "",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGroupChange = (value: string) => {
    if (value === "CREATE_NEW") {
      onCreateNewGroup?.();
    } else {
      setForm({ ...form, groupId: value });
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title="Invite New Athlete"
          icon={<Send className="w-6 h-6" />}
          onClose={onClose}
        />
        <ModalContent>
          <div className="space-y-4">
            {/* Name Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <FloatingLabelInput
                label="First Name *"
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                fullWidth
                required
              />
              <FloatingLabelInput
                label="Last Name *"
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                fullWidth
                required
              />
            </div>

            {/* Email Input */}
            <FloatingLabelInput
              label="Email Address (Optional)"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              helperText="Leave blank to add athlete profile without sending invite yet"
              fullWidth
            />

            {/* Initial Group Select */}
            <Select
              label="Initial Group (Optional)"
              value={form.groupId}
              onChange={(e) => handleGroupChange(e.target.value)}
              fullWidth
              options={[
                { value: "", label: "No group assigned" },
                ...groups.map((group) => ({
                  value: group.id,
                  label: group.name,
                })),
                { value: "CREATE_NEW", label: "+ Create New Group" },
              ]}
            />

            {/* Notes Textarea */}
            <FloatingLabelTextarea
              label="Notes (Optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              fullWidth
            />

            {/* Info Box */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Send className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <Heading level="h4" className="mb-1">
                    How It Works
                  </Heading>
                  <Body variant="secondary" size="sm">
                    {form.email
                      ? "The athlete will receive an email with a secure link to create their account."
                      : "Add athlete profile now, then add email later to send the invite."}
                  </Body>
                </div>
              </div>
            </div>
          </div>
        </ModalContent>
        <ModalFooter align="between">
          <Button onClick={onClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="flex-1"
            disabled={!form.firstName || !form.lastName || isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            {form.email ? "Send Invite" : "Add Athlete"}
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
