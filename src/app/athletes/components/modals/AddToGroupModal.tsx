"use client";

import { useState } from "react";
import { Users, Plus, CheckCircle } from "lucide-react";
import {
  ModalBackdrop,
  ModalHeader,
  ModalContent,
} from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { Heading, Body } from "@/components/ui/Typography";

interface AthleteGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
  athleteIds?: string[];
}

interface EnhancedAthlete {
  id: string;
  firstName?: string;
  fullName?: string;
}

interface AddToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  athlete: EnhancedAthlete;
  groups: AthleteGroup[];
  onAddToGroup: (groupId: string, athleteId: string) => Promise<void>;
  onCreateGroup: () => void;
}

export default function AddToGroupModal({
  isOpen,
  onClose,
  athlete,
  groups,
  onAddToGroup,
  onCreateGroup,
}: AddToGroupModalProps) {
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);

  const handleAddToGroup = async (groupId: string) => {
    setAddingToGroup(groupId);
    try {
      await onAddToGroup(groupId, athlete.id);
      onClose();
    } finally {
      setAddingToGroup(null);
    }
  };

  const handleCreateGroupClick = () => {
    onClose();
    onCreateGroup();
  };

  return (
    <ModalBackdrop isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <ModalHeader
          title={`Add ${athlete.firstName || athlete.fullName} to Group`}
          icon={<Users className="w-6 h-6" />}
          onClose={onClose}
        />
        <ModalContent>
          {groups.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No groups available"
              description="Create a group first to organize your athletes."
              action={{
                label: "Create First Group",
                onClick: handleCreateGroupClick,
                icon: <Plus className="w-4 h-4" />,
              }}
              size="sm"
            />
          ) : (
            <div className="space-y-2">
              {groups.map((group) => {
                const isInGroup = group.athleteIds?.includes(athlete.id);
                const isAdding = addingToGroup === group.id;

                return (
                  <button
                    key={group.id}
                    onClick={() => !isInGroup && handleAddToGroup(group.id)}
                    disabled={isInGroup || isAdding}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      isInGroup
                        ? "border-accent-green/30 bg-accent-green/10 cursor-default"
                        : isAdding
                          ? "border-accent-blue/30 bg-accent-blue/10 cursor-wait"
                          : "border-silver-300 hover:border-accent-blue hover:bg-accent-blue/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Heading
                          level="h4"
                          className="flex items-center gap-2 text-base"
                        >
                          {group.name}
                          {isInGroup && (
                            <CheckCircle className="w-4 h-4 text-accent-green" />
                          )}
                        </Heading>
                        {group.description && (
                          <Body variant="secondary" className="text-sm mt-1">
                            {group.description}
                          </Body>
                        )}
                        <Body
                          variant="secondary"
                          className="text-xs mt-1 opacity-70"
                        >
                          {group.athleteIds?.length || 0} athletes
                        </Body>
                      </div>
                      {group.color && (
                        <div
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ModalContent>
      </div>
    </ModalBackdrop>
  );
}
