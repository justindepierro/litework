"use client";

import {
  Users,
  MoreVertical,
  Edit3,
  Archive,
  Trash2,
  Plus,
} from "lucide-react";
import { AthleteGroup } from "@/types";
import {
  Dropdown,
  DropdownItem,
  DropdownDivider,
} from "@/components/ui/Dropdown";
import { Body, Heading } from "@/components/ui/Typography";

interface GroupsSectionProps {
  groups: AthleteGroup[];
  openGroupMenuId: string | null;
  onOpenMenu: (groupId: string | null) => void;
  onEditGroup: (group: AthleteGroup) => void;
  onArchiveGroup: (group: AthleteGroup) => void;
  onDeleteGroup: (groupId: string) => void;
  onManageMembers: (group: AthleteGroup) => void;
}

/**
 * GroupsSection Component
 * Displays athlete groups with management controls
 */
export default function GroupsSection({
  groups,
  openGroupMenuId,
  onOpenMenu,
  onEditGroup,
  onArchiveGroup,
  onDeleteGroup,
  onManageMembers,
}: GroupsSectionProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-linear-to-br from-white to-silver-50 rounded-xl shadow-md border-2 border-accent-blue-300 p-4">
      <Heading level="h3" className="mb-4 flex items-center gap-3">
        <div className="p-2 bg-linear-to-br from-accent-blue-400 to-accent-purple-500 rounded-lg shadow-md">
          <Users className="w-5 h-5 text-white" />
        </div>
        <span className="bg-linear-to-r from-accent-blue-600 to-accent-purple-600 bg-clip-text text-transparent font-bold">
          Groups ({groups.length})
        </span>
      </Heading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((group) => {
          // Get athlete count directly from group's athleteIds array
          const athleteCount = group.athleteIds?.length || 0;

          // Rotating gradient backgrounds for visual distinction
          const gradients = [
            "bg-linear-to-br from-accent-purple-100 to-accent-purple-50 border-accent-purple-400 hover:border-accent-purple-500",
            "bg-linear-to-br from-accent-blue-100 to-accent-blue-50 border-accent-blue-400 hover:border-accent-blue-500",
            "bg-linear-to-br from-accent-pink-100 to-accent-pink-50 border-accent-pink-400 hover:border-accent-pink-500",
            "bg-linear-to-br from-accent-cyan-100 to-accent-cyan-50 border-accent-cyan-400 hover:border-accent-cyan-500",
            "bg-linear-to-br from-accent-orange-100 to-accent-orange-50 border-accent-orange-400 hover:border-accent-orange-500",
            "bg-linear-to-br from-accent-green-100 to-accent-green-50 border-accent-green-400 hover:border-accent-green-500",
          ];
          const gradientIndex = groups.findIndex((g) => g.id === group.id);
          const gradient = gradients[gradientIndex % gradients.length];

          return (
            <div
              key={group.id}
              className={`p-4 ${gradient} border-2 rounded-xl relative shadow-md hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}
            >
              {/* 3-dot menu */}
              <div className="absolute top-3 right-3">
                <Dropdown
                  trigger={
                    <button
                      className="p-1 hover:bg-surface-hover rounded-full transition-colors"
                      aria-label="Group menu"
                    >
                      <MoreVertical className="w-5 h-5 text-secondary" />
                    </button>
                  }
                  align="right"
                  width="sm"
                  isOpen={openGroupMenuId === group.id}
                  onOpenChange={(isOpen) =>
                    onOpenMenu(isOpen ? group.id : null)
                  }
                >
                  <DropdownItem
                    icon={<Edit3 className="w-4 h-4" />}
                    onClick={() => {
                      onEditGroup(group);
                      onOpenMenu(null);
                    }}
                  >
                    Edit Group
                  </DropdownItem>
                  <DropdownItem
                    icon={<Archive className="w-4 h-4" />}
                    onClick={() => onArchiveGroup(group)}
                  >
                    Archive Group
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem
                    icon={<Trash2 className="w-4 h-4" />}
                    variant="danger"
                    onClick={() => onDeleteGroup(group.id)}
                  >
                    Delete Group
                  </DropdownItem>
                </Dropdown>
              </div>

              {/* Group content (clickable to manage members) */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-2 pr-8">
                  <Heading level="h4" className="text-primary">
                    {group.name}
                  </Heading>
                  {group.color && (
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: group.color }}
                    />
                  )}
                </div>
                {group.description && (
                  <Body
                    className="text-sm mb-2 line-clamp-2"
                    variant="secondary"
                  >
                    {group.description}
                  </Body>
                )}
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onManageMembers(group)}
                    className="flex items-center gap-2 text-sm text-secondary hover:text-primary transition-colors"
                    aria-label={`Manage ${group.name} members`}
                  >
                    <Users className="w-4 h-4" />
                    <span>
                      {athleteCount} athlete
                      {athleteCount !== 1 ? "s" : ""}
                    </span>
                  </button>
                  <button
                    onClick={() => onManageMembers(group)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-linear-to-br from-accent-blue-500 to-accent-purple-500 hover:from-accent-blue-600 hover:to-accent-purple-600 text-white text-xs font-bold rounded-full shadow-md hover:shadow-lg transition-all"
                    aria-label="Add athletes to group"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
