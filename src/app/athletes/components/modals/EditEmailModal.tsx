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
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Heading, Body } from "@/components/ui/Typography";

export interface EditEmailForm {
  email: string;
}

interface EnhancedAthlete {
  id: string;
  fullName?: string;
  email?: string;
}

interface EditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: EnhancedAthlete;
  initialEmail: string;
  onUpdateEmail: (email: string) => Promise<void>;
}

export default function EditEmailModal({
  isOpen,
  onClose,
  athlete,
  initialEmail,
  onUpdateEmail,
}: EditEmailModalProps) {
  const [email, setEmail] = useState(initialEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setEmail("");
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setIsSubmitting(true);
    try {
      await onUpdateEmail(trimmedEmail);
      setEmail("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose}>
      <div
        className="
        bg-white 
        w-full h-full
        sm:rounded-xl sm:max-w-md sm:h-auto
        flex flex-col 
        sm:shadow-2xl
        safe-area-inset
      "
      >
        <ModalHeader
          title={`${athlete.email ? "Edit" : "Add"} Email Address`}
          icon={<Send className="w-6 h-6" />}
          onClose={handleClose}
        />
        <div className="flex-1 overflow-y-auto">
          <ModalContent>
            <div className="space-y-4">
              <div>
                <Body variant="secondary" className="block text-sm mb-2">
                  Athlete
                </Body>
                <Body variant="primary" className="font-medium">
                  {athlete.fullName || "Unknown"}
                </Body>
              </div>

              {/* Email Input */}
              <FloatingLabelInput
                label="Email Address *"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                fullWidth
                required
                helperText={
                  athlete.email ? `Current: ${athlete.email}` : undefined
                }
              />

              {/* Info Box */}
              <div className="bg-accent-blue/10 p-4 rounded-lg border border-accent-blue/20">
                <div className="flex items-start gap-3">
                  <Send className="h-5 w-5 text-accent-blue shrink-0 mt-0.5" />
                  <div>
                    <Heading
                      level="h4"
                      className="text-sm mb-1 text-accent-blue"
                    >
                      Ready to Send Invite
                    </Heading>
                    <Body variant="secondary" className="text-sm">
                      After updating the email, you can use the
                      &ldquo;Resend&rdquo; button to send the invitation.
                    </Body>
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
        </div>

        <ModalFooter align="between">
          <Button onClick={handleClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="flex-1"
            disabled={!email.trim() || isSubmitting}
          >
            {isSubmitting
              ? "Updating..."
              : `${athlete.email ? "Update" : "Add"} Email`}
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
