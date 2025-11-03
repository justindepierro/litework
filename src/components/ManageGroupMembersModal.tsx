/**
 * Manage Group Members Modal
 * Assign/unassign athletes to/from a group
 */

"use client";

import { useState, useEffect } from "react";
import { X, UserPlus, Users, Search, Check } from "lucide-react";
import { User as UserType, AthleteGroup } from "@/types";
import { useToast } from "@/components/ToastProvider";

interface ManageGroupMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: AthleteGroup;
  allAthletes: UserType[];
  onMembersUpdated: () => void;
}

export default function ManageGroupMembersModal({
  isOpen,
  onClose,
  group,
  allAthletes,
  onMembersUpdated,
}: ManageGroupMembersModalProps) {
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadGroupMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/groups/members?groupId=${group.id}`);
      const data = await response.json();

      if (data.success) {
        setGroupMembers(data.athletes.map((a: UserType) => a.id));
      }
    } catch (error) {
      console.error("Failed to load group members:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && group) {
      loadGroupMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, group]);

  const toggleAthlete = async (athleteId: string) => {
    const isCurrentlyInGroup = groupMembers.includes(athleteId);

    try {
      setIsSaving(true);

      if (isCurrentlyInGroup) {
        // Remove from group
        const response = await fetch(
          `/api/groups/members?groupId=${group.id}&athleteId=${athleteId}`,
          { method: "DELETE" }
        );
        const data = await response.json();

        if (data.success) {
          setGroupMembers(groupMembers.filter((id) => id !== athleteId));
        }
      } else {
        // Add to group
        const response = await fetch("/api/groups/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupId: group.id,
            athleteIds: [athleteId],
          }),
        });
        const data = await response.json();

        if (data.success) {
          setGroupMembers([...groupMembers, athleteId]);
        }
      }

      onMembersUpdated();
    } catch (error) {
      console.error("Failed to update group membership:", error);
      toast.error("Failed to update group membership");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAthletes = allAthletes.filter(
    (athlete) =>
      `${athlete.firstName} ${athlete.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      athlete.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Manage Group Members
              </h2>
              <p className="text-gray-600 mt-1">
                {group.name}
                {group.description && ` - ${group.description}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-3 text-sm text-gray-600">
            {groupMembers.length} of {allAthletes.length} athletes in this group
          </div>
        </div>

        {/* Athletes List */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredAthletes.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No athletes found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAthletes.map((athlete) => {
                const isInGroup = groupMembers.includes(athlete.id);
                return (
                  <button
                    key={athlete.id}
                    onClick={() => toggleAthlete(athlete.id)}
                    disabled={isSaving}
                    className={`w-full p-4 rounded-lg border-2 transition-all flex items-center justify-between ${
                      isInGroup
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    } ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {athlete.firstName[0]}
                        {athlete.lastName[0]}
                      </div>
                      <div className="text-left">
                        <div className="font-semibold text-gray-900">
                          {athlete.firstName} {athlete.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {athlete.email}
                        </div>
                      </div>
                    </div>

                    {isInGroup && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <Check className="w-5 h-5" />
                        <span className="text-sm font-medium">In Group</span>
                      </div>
                    )}
                    {!isInGroup && (
                      <div className="text-gray-400">
                        <UserPlus className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
