import { useState } from "react";
import {
  Mail,
  Phone,
  Calendar,
  Users,
  Activity,
  Trophy,
  TrendingUp,
  AlertCircle,
  User,
  Edit,
  MessageCircle,
  BarChart3,
} from "lucide-react";
import { User as UserType, AthleteKPI, AthleteGroup } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ModalBackdrop, ModalHeader, ModalContent } from "@/components/ui/Modal";

interface AthleteDetailModalProps {
  athlete: UserType & {
    status?: string;
    profileImage?: string | null;
    bio?: string | null;
    injuryStatus?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    dateOfBirth?: Date;
    position?: string;
    sport?: string;
    joinDate?: Date;
    lastActivity?: Date | null;
    stats?: {
      totalWorkouts: number;
      completedWorkouts: number;
      thisMonthWorkouts: number;
      totalPRs: number;
      recentPRs: number;
      lastWorkout: Date | null;
      attendanceRate?: number;
      currentStreak?: number;
    };
  };
  groups?: AthleteGroup[];
  onClose: () => void;
  onEdit?: () => void;
  onMessage?: () => void;
  onViewProgress?: () => void;
}

export default function AthleteDetailModal({
  athlete,
  groups = [],
  onClose,
  onEdit,
  onMessage,
  onViewProgress,
}: AthleteDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "prs" | "history">(
    "overview"
  );

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const completionRate =
    athlete.stats && athlete.stats.totalWorkouts > 0
      ? Math.round(
          (athlete.stats.completedWorkouts / athlete.stats.totalWorkouts) * 100
        )
      : 0;

  return (
    <ModalBackdrop isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <ModalHeader
          title={`${athlete.firstName} ${athlete.lastName}`}
          subtitle={`${athlete.role} - ${athlete.status || "Active"}${athlete.injuryStatus ? ` (${athlete.injuryStatus})` : ""}`}
          onClose={onClose}
          icon={<User className="w-6 h-6 text-primary" />}
        />

        <ModalContent>
          {/* Profile Avatar & Status Badges */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {athlete.firstName?.[0]}
              {athlete.lastName?.[0]}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Badge size="md">{athlete.role}</Badge>
                {athlete.status === "active" && (
                  <Badge variant="success" size="md">
                    <Activity className="w-3 h-3" />
                    Active
                  </Badge>
                )}
                {athlete.injuryStatus && (
                  <Badge variant="warning" size="md">
                    <AlertCircle className="w-3 h-3" />
                    {athlete.injuryStatus}
                  </Badge>
                )}
              </div>
              {/* Quick Actions */}
              <div className="flex gap-2">
              {onMessage && (
                <button
                  onClick={onMessage}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>
              )}
              {onViewProgress && (
                <button
                  onClick={onViewProgress}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Progress
                </button>
              )}
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "overview"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("prs")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "prs"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Personal Records
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === "history"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              History
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{athlete.email}</p>
                    </div>
                  </div>
                  {athlete.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{athlete.phone}</p>
                      </div>
                    </div>
                  )}
                  {athlete.dateOfBirth && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Age</p>
                        <p className="font-medium">
                          {calculateAge(athlete.dateOfBirth)} years old
                        </p>
                      </div>
                    </div>
                  )}
                  {athlete.emergencyContact && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Emergency Contact
                        </p>
                        <p className="font-medium">
                          {athlete.emergencyContact}
                        </p>
                        {athlete.emergencyPhone && (
                          <p className="text-sm text-gray-600">
                            {athlete.emergencyPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sport & Position */}
              {(athlete.sport || athlete.position) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-blue-600" />
                    Athletics
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {athlete.sport && (
                      <div>
                        <p className="text-sm text-gray-600">Sport</p>
                        <p className="font-medium">{athlete.sport}</p>
                      </div>
                    )}
                    {athlete.position && (
                      <div>
                        <p className="text-sm text-gray-600">Position</p>
                        <p className="font-medium">{athlete.position}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Performance Stats */}
              {athlete.stats && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Performance Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Workouts</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {athlete.stats.totalWorkouts}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Completion Rate</p>
                      <p className="text-2xl font-bold text-green-600">
                        {completionRate}%
                      </p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Personal Records</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {athlete.stats.totalPRs}
                      </p>
                    </div>
                    {athlete.stats.currentStreak !== undefined && (
                      <div className="bg-orange-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">Current Streak</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {athlete.stats.currentStreak} days
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bio / Notes */}
              {athlete.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notes</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {athlete.bio}
                  </p>
                </div>
              )}

              {/* Groups */}
              {athlete.groupIds && athlete.groupIds.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Groups
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {athlete.groupIds.map((groupId) => {
                      const group = groups.find((g) => g.id === groupId);
                      return (
                        <Badge
                          key={groupId}
                          size="md"
                          style={{
                            backgroundColor: group?.color
                              ? `${group.color}20`
                              : undefined,
                            color: group?.color || undefined,
                          }}
                        >
                          {group?.name || groupId}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "prs" && (
            <div>
              {athlete.personalRecords && athlete.personalRecords.length > 0 ? (
                <div className="space-y-4">
                  {athlete.personalRecords.map((pr: AthleteKPI) => (
                    <div
                      key={pr.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-lg">
                            {pr.exerciseName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Achieved on{" "}
                            {new Date(pr.dateAchieved).toLocaleDateString()}
                          </p>
                          {pr.notes && (
                            <p className="text-sm text-gray-700 mt-2">
                              {pr.notes}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-blue-600">
                            {pr.currentPR}
                          </p>
                          <p className="text-sm text-gray-600">lbs</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No personal records yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Workout history coming soon</p>
            </div>
          )}
        </div>
        </ModalContent>
      </div>
    </ModalBackdrop>
  );
}
