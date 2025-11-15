/**
 * Notifications Page
 * Full-page view of all in-app notifications
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import Navigation from "@/components/Navigation";
import { EmptyNotifications } from "@/components/ui/EmptyState";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Display, Body } from "@/components/ui/Typography";

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
      <>
        <Navigation />
        <main className="min-h-screen bg-silver-100 pt-20">
          <div className="max-w-4xl mx-auto px-4 py-8">
            <p className="text-center text-body-secondary">
              Please log in to view notifications.
            </p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-silver-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Bell className="w-8 h-8 text-primary" />
                <div>
                  <Display size="md">Notifications</Display>
                  <Body className="text-sm mt-1" variant="secondary">
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "All caught up!"}
                  </Body>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Buttons */}
                <div className="flex bg-silver-200 rounded-lg p-1">
                  <button
                    onClick={() => setFilter("all")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === "all"
                        ? "bg-white text-heading-primary shadow-sm"
                        : "text-body-secondary hover:text-heading-primary"
                    }`}
                  >
                    <Filter className="w-4 h-4 inline mr-1" />
                    All
                  </button>
                  <button
                    onClick={() => setFilter("unread")}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filter === "unread"
                        ? "bg-white text-heading-primary shadow-sm"
                        : "text-body-secondary hover:text-heading-primary"
                    }`}
                  >
                    Unread ({unreadCount})
                  </button>
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
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
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3
                            className={`text-base font-medium text-heading-primary ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </h3>
                          <span className="text-sm text-caption-muted shrink-0">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        {notification.body && (
                          <Body variant="secondary" className="mb-3">
                            {notification.body}
                          </Body>
                        )}
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="px-3 py-1.5 text-sm text-primary hover:text-primary-dark font-medium bg-primary-lighter hover:bg-primary-light rounded-md transition-colors flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="px-3 py-1.5 text-sm text-error hover:text-error-dark font-medium bg-error-lighter hover:bg-error-light rounded-md transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
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
            <div className="text-center mt-6">
              <Body className="text-sm" variant="secondary">
                Showing {notifications.length} notifications. Older
                notifications auto-expire after 7 days.
              </Body>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
