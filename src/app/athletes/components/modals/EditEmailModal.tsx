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
import { Input } from "@/components/ui/Input";
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
    if (!email) return;

    setIsSubmitting(true);
    try {
      await onUpdateEmail(email);
      setEmail("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-xl w-full max-w-md">
        <ModalHeader
          title={`${athlete.email ? "Edit" : "Add"} Email Address`}
          icon={<Send className="w-6 h-6" />}
          onClose={handleClose}
        />
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
            <Input
              label="Email Address *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@email.com"
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
                  <Heading level="h4" className="text-sm mb-1 text-accent-blue">
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
        <ModalFooter align="between">
          <Button onClick={handleClose} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="primary"
            className="flex-1"
            disabled={!email || isSubmitting}
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
