"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
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

export interface MessageForm {
  recipientId: string;
  subject: string;
  message: string;
  priority: "low" | "normal" | "high";
  notifyViaEmail: boolean;
}

interface EnhancedAthlete {
  id: string;
  fullName?: string;
  communication?: {
    preferredContact?: "app" | "email" | "sms";
  };
}

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: EnhancedAthlete;
  initialForm: MessageForm;
  onSendMessage: (form: MessageForm) => Promise<void>;
}

export default function MessageModal({
  isOpen,
  onClose,
  athlete,
  initialForm,
  onSendMessage,
}: MessageModalProps) {
  const [form, setForm] = useState<MessageForm>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.message) return;

    setIsSubmitting(true);
    try {
      await onSendMessage(form);
      // Reset form on success
      setForm({
        recipientId: "",
        subject: "",
        message: "",
        priority: "normal",
        notifyViaEmail: false,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <ModalHeader
          title={`Message ${athlete.fullName || "Athlete"}`}
          icon={<MessageCircle className="w-6 h-6" />}
          onClose={onClose}
        />
        <ModalContent>
          <div className="space-y-4">
            {/* Subject Input */}
            <FloatingLabelInput
              label="Subject (Optional)"
              type="text"
              value={form.subject}
              onChange={(e) =>
                setForm({
                  ...form,
                  subject: e.target.value,
                })
              }
              fullWidth
            />

            {/* Message Textarea */}
            <FloatingLabelTextarea
              label="Message *"
              value={form.message}
              onChange={(e) =>
                setForm({
                  ...form,
                  message: e.target.value,
                })
              }
              rows={6}
              fullWidth
              required
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Priority Select */}
              <Select
                label="Priority"
                value={form.priority}
                onChange={(e) =>
                  setForm({
                    ...form,
                    priority: e.target.value as "low" | "normal" | "high",
                  })
                }
                fullWidth
                options={[
                  { value: "low", label: "Low" },
                  { value: "normal", label: "Normal" },
                  { value: "high", label: "High" },
                ]}
              />

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.notifyViaEmail}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        notifyViaEmail: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-accent-blue bg-silver-100 border-silver-300 rounded focus:ring-accent-blue"
                  />
                  <Body variant="secondary" className="text-sm">
                    Also send via email
                  </Body>
                </label>
              </div>
            </div>

            {/* Communication Tip */}
            <div className="bg-accent-green/10 p-4 rounded-lg border border-accent-green/20">
              <div className="flex items-start gap-3">
                <MessageCircle className="h-5 w-5 text-accent-green shrink-0 mt-0.5" />
                <div>
                  <Heading
                    level="h4"
                    className="text-sm mb-1 text-accent-green"
                  >
                    Communication Tip
                  </Heading>
                  <Body variant="secondary" className="text-sm">
                    {athlete.communication?.preferredContact === "email"
                      ? `${athlete.fullName || "This athlete"} prefers email communication. Consider checking the email option above.`
                      : `${athlete.fullName || "This athlete"} prefers app notifications. They'll be notified in the app immediately.`}
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
            disabled={!form.message || isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </ModalFooter>
      </div>
    </ModalBackdrop>
  );
}
