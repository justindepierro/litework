/**
 * Notifications Page
 * Full-page view of all in-app notifications
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { EmptyNotifications } from "@/components/ui/EmptyState";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Body, Heading, Caption } from "@/components/ui/Typography";

interface InAppNotification {
  id: string;
  type: string;
  title: string;
  body?: string;
  icon?: string;
  url?: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const { showSkeleton } = useMinimumLoadingTime(isLoading, 300);

  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const url =
        filter === "unread"
          ? "/api/notifications/inbox?unread_only=true&limit=50"
          : "/api/notifications/inbox?limit=50";

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await fetch("/api/notifications/inbox", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      const notification = notifications.find((n) => n.id === notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!user) {
    return (
      <main className="min-h-screen bg-silver-100 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <PageHeader
            title="Notifications"
            subtitle="Please sign in to view your in-app updates."
            icon={<Bell className="w-6 h-6" />}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-silver-100 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <PageHeader
            title="Notifications"
            subtitle={
              unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"
            }
            icon={<Bell className="w-6 h-6" />}
            actions={
              unreadCount > 0 ? (
                <Button
                  variant="success"
                  size="sm"
                  leftIcon={<CheckCheck className="w-4 h-4" />}
                  onClick={markAllAsRead}
                >
                  Mark all read
                </Button>
              ) : undefined
            }
          />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "primary" : "secondary"}
                size="sm"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "unread" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setFilter("unread")}
              >
                Unread ({unreadCount})
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {showSkeleton ? (
            <div className="p-6 space-y-4">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : notifications.length === 0 ? (
            <EmptyNotifications />
          ) : (
            <div className="divide-y divide-silver-300">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-silver-200 transition-colors cursor-pointer ${
                    !notification.read ? "bg-primary-lighter" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl shrink-0">
                      {notification.icon || "🔔"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <Heading
                          level="h4"
                          className={`text-base ${
                            !notification.read ? "font-semibold" : ""
                          }`}
                        >
                          {notification.title}
                        </Heading>
                        <Caption className="shrink-0">
                          {formatTime(notification.createdAt)}
                        </Caption>
                      </div>
                      {notification.body && (
                        <Body variant="secondary" className="mb-3">
                          {notification.body}
                        </Body>
                      )}
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(event) => {
                              event.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            leftIcon={<Check className="w-4 h-4" />}
                          >
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Load More (if needed) */}
        {notifications.length >= 50 && (
          <div className="mt-6 text-center">
            <Body className="text-sm" variant="secondary">
              Showing {notifications.length} notifications. Older notifications
              auto-expire after 7 days.
            </Body>
          </div>
        )}
      </div>
    </main>
  );
}
