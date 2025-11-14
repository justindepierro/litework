"use client";

import { useState } from "react";
import { Trophy, Plus, Target, Trash2 } from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
} from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Heading, Body } from "@/components/ui/Typography";
import { AthleteKPI } from "@/types";

export interface KPIForm {
  kpiName: string;
  value: string;
  dateSet: string;
}

interface EnhancedAthlete {
  id: string;
  fullName?: string;
  personalRecords?: AthleteKPI[];
}

interface KPIModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: EnhancedAthlete;
  onAddKPI: (kpi: KPIForm) => Promise<void>;
  onDeleteKPI?: (kpiId: string) => Promise<void>;
}

export default function KPIModal({
  isOpen,
  onClose,
  athlete,
  onAddKPI,
  onDeleteKPI,
}: KPIModalProps) {
  const [form, setForm] = useState<KPIForm>({
    kpiName: "",
    value: "",
    dateSet: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!form.kpiName || !form.value) return;

    setIsSubmitting(true);
    try {
      await onAddKPI(form);
      // Reset form on success
      setForm({
        kpiName: "",
        value: "",
        dateSet: new Date().toISOString().split("T")[0],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (kpiId: string) => {
    if (onDeleteKPI) {
      await onDeleteKPI(kpiId);
    }
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="
        bg-white 
        w-full h-full
        sm:rounded-xl sm:max-w-2xl sm:h-auto sm:max-h-[85vh]
        flex flex-col 
        sm:shadow-2xl
        safe-area-inset
      ">
        <ModalHeader
          title={`Manage Personal Records - ${athlete.fullName || "Athlete"}`}
          icon={<Trophy className="w-6 h-6" />}
          onClose={onClose}
        />
        <div className="flex-1 overflow-y-auto">
          <ModalContent>
          {/* Add New PR Form */}
          <div className="bg-silver-100 rounded-lg p-4 mb-6">
            <Heading level="h3" className="mb-3">
              Add New Personal Record
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelInput
                label="Exercise Name"
                type="text"
                value={form.kpiName}
                onChange={(e) => setForm({ ...form, kpiName: e.target.value })}
                fullWidth
                required
              />
              <FloatingLabelInput
                label="Weight (lbs)"
                type="number"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
                fullWidth
                required
              />
              <FloatingLabelInput
                label="Date Achieved"
                type="date"
                value={form.dateSet}
                onChange={(e) => setForm({ ...form, dateSet: e.target.value })}
                fullWidth
                required
              />
              <div className="flex items-end">
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  fullWidth
                  disabled={!form.kpiName || !form.value || isSubmitting}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add PR
                </Button>
              </div>
            </div>
          </div>

          {/* Current PRs List */}
          <div>
            <Heading level="h3" className="mb-3">
              Current Personal Records ({athlete.personalRecords?.length || 0})
            </Heading>
            {athlete.personalRecords?.length ? (
              <div className="space-y-3">
                {athlete.personalRecords.map((kpi: AthleteKPI) => (
                  <div
                    key={kpi.id}
                    className="flex items-center justify-between p-3 border border-silver-300 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-accent-blue" />
                      <div>
                        <Body variant="primary" className="font-medium">
                          {kpi.exerciseName}
                        </Body>
                        <Body variant="secondary" size="sm">
                          {kpi.currentPR} lbs •{" "}
                          {new Date(kpi.dateAchieved).toLocaleDateString()}
                        </Body>
                      </div>
                    </div>
                    {onDeleteKPI && (
                      <button
                        onClick={() => handleDelete(kpi.id)}
                        className="p-2 text-error hover:bg-error-lighter rounded-lg transition-colors"
                        aria-label={`Delete ${kpi.exerciseName} record`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Body variant="secondary">
                  No personal records yet. Add some PRs to get started!
                </Body>
              </div>
            )}
          </div>
        </ModalContent>
        </div>
      </div>
    </ModalBackdrop>
  );
}
