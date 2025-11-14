/**
 * NotificationBell Component
 * Shows notification icon with badge count and dropdown
 */

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { Bell, X, Check, CheckCheck } from "lucide-react";
import { useAsyncState } from "@/hooks/use-async-state";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyNotifications } from "@/components/ui/EmptyState";

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

export default function NotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isLoading, execute } = useAsyncState<void>();
  const { showSkeleton } = useMinimumLoadingTime(isLoading, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { error: toastError } = useToast();

  // Memoized function to load unread count
  const loadUnreadCount = useCallback(async () => {
    // Don't attempt to load if no user
    if (!user) return;

    try {
      const response = await fetch(
        "/api/notifications/inbox?limit=1&unread_only=true"
      );

      // Silently handle auth errors (user not logged in)
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, silently return
          return;
        }
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      // Only log non-auth errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to load unread count:", error);
      }
    }
  }, [user]);

  // Memoized function to load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    execute(async () => {
      const { data, error } = await apiClient.requestWithResponse<{
        success: boolean;
        notifications: InAppNotification[];
        unreadCount: number;
      }>("/api/notifications/inbox?limit=10", { 
        showErrorToast: false  // Silently handle errors
      });

      if (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to load notifications:", error);
        }
        return;
      }

      if (data?.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    });
  }, [user, execute]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (user && isOpen) {
      loadNotifications();
    }
  }, [user, isOpen, loadNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!user) return;

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, loadUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await apiClient.requestWithResponse(
      "/api/notifications/inbox",
      {
        method: "PATCH",
        body: { notificationId },
        showErrorToast: false,
      }
    );

    if (error) {
      console.error("Failed to mark notification as read:", error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const { error } = await apiClient.requestWithResponse(
      "/api/notifications/inbox",
      {
        method: "PATCH",
        body: { markAllRead: true },
        toastError,
      }
    );

    if (error) {
      console.error("Failed to mark all as read:", error);
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await apiClient.requestWithResponse(
      "/api/notifications/inbox",
      {
        method: "DELETE",
        body: { notificationId },
        toastError,
      }
    );

    if (error) {
      console.error("Failed to delete notification:", error);
      return;
    }

    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (!notifications.find((n) => n.id === notificationId)?.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNotificationClick = (notification: InAppNotification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    if (notification.url) {
      window.location.href = notification.url;
      setIsOpen(false);
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
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-accent-green transition-colors rounded-lg hover:bg-navy-700"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[95vw] max-h-[600px] bg-white rounded-lg shadow-2xl border-2 border-silver-400 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-silver-300 bg-gradient-to-r from-info-lightest to-accent-purple-50">
            <h3 className="text-lg font-bold text-navy-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-primary-dark hover:text-primary-darker font-semibold flex items-center gap-1 px-3 py-1.5 bg-white rounded-md border border-info-lighter hover:bg-info-lightest transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto max-h-[500px]">
            {showSkeleton ? (
              <div className="p-4 space-y-3">
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
                    className={`p-4 hover:bg-silver-200 transition-colors cursor-pointer ${
                      !notification.read ? "bg-info-lightest" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div className="text-2xl shrink-0">
                        {notification.icon || "🔔"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-medium text-navy-900 ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="shrink-0 p-1 text-neutral hover:text-neutral-darker rounded"
                            aria-label="Delete notification"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {notification.body && (
                          <p className="text-sm text-neutral-dark mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-neutral">
                            {formatTime(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                              className="text-xs text-primary hover:text-primary-dark flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-silver-300 bg-silver-200">
              <button
                onClick={() => {
                  window.location.href = "/notifications";
                  setIsOpen(false);
                }}
                className="text-sm text-primary hover:text-primary-dark font-medium w-full text-center"
              >
                View all notifications →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
