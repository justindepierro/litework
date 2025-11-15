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
import { Body } from "@/components/ui/Typography";

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
    <div className="mb-6 bg-white rounded-xl shadow-sm border border-silver-400 p-4">
      <h3 className="text-lg font-semibold text-heading-primary mb-4 flex items-center gap-2">
        <Users className="w-5 h-5 text-accent" />
        Groups ({groups.length})
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {groups.map((group) => {
          // Get athlete count directly from group's athleteIds array
          const athleteCount = group.athleteIds?.length || 0;

          return (
            <div
              key={group.id}
              className="p-4 bg-silver-200 border-2 border-silver-400 rounded-lg relative"
            >
              {/* 3-dot menu */}
              <div className="absolute top-3 right-3">
                <Dropdown
                  trigger={
                    <button
                      className="p-1 hover:bg-silver-300 rounded-full transition-colors"
                      aria-label="Group menu"
                    >
                      <MoreVertical className="w-5 h-5 text-silver-700" />
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
                  <h4 className="font-semibold text-navy-900">{group.name}</h4>
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
                    className="flex items-center gap-2 text-sm text-silver-600 hover:text-silver-800 transition-colors"
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
                    className="flex items-center gap-1 px-3 py-1.5 bg-accent-blue hover:bg-accent-blue/90 text-white text-xs font-medium rounded-full transition-colors"
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
