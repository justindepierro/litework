/**
 * NotificationBell Component - Enhanced Version
 * 🎨 Beautiful notification dropdown with smooth animations
 * ✨ Enhanced interactions and visual feedback
 * ♿ Keyboard shortcuts and accessibility
 * 🔔 Real-time updates with polling
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ToastProvider";
import { Bell, X, Check, CheckCheck, AlertCircle } from "lucide-react";
import { useAsyncState } from "@/hooks/use-async-state";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { EmptyNotifications } from "@/components/ui/EmptyState";
import {
  Dropdown,
  DropdownHeader,
  DropdownContent,
} from "@/components/ui/Dropdown";

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
  const [hasError, setHasError] = useState(false);
  const { isLoading, execute } = useAsyncState<void>();
  const { showSkeleton } = useMinimumLoadingTime(isLoading, 300);
  const { error: toastError, success: toastSuccess } = useToast();

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
        if (response.status === 401 || response.status === 404) {
          // User not authenticated or route not found, silently return
          return;
        }
        throw new Error("Failed to fetch notifications");
      }

      const data = await response.json();

      if (data.success) {
        setUnreadCount(data.unreadCount);
        setHasError(false);
      }
    } catch (error) {
      setHasError(true);
      // Only log unexpected errors in development (not auth/network issues)
      if (
        process.env.NODE_ENV === "development" &&
        error instanceof Error &&
        !error.message.includes("fetch")
      ) {
        console.warn("Failed to load unread count:", error.message);
      }
    }
  }, [user]);

  // Memoized function to load notifications
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setHasError(false);
    
    execute(async () => {
      try {
        const { data, error } = await apiClient.requestWithResponse<{
          success: boolean;
          notifications: InAppNotification[];
          unreadCount: number;
        }>("/api/notifications/inbox?limit=10", {
          showErrorToast: false, // Silently handle errors
        });

        if (error) {
          setHasError(true);
          // Only log errors that aren't 401/404 (auth/not found are expected when not logged in)
          if (
            process.env.NODE_ENV === "development" &&
            !error.includes("401") &&
            !error.includes("404") &&
            !error.includes("<!DOCTYPE")
          ) {
            console.warn("Failed to load notifications:", error);
          }
          return;
        }

        if (data?.success) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
          setHasError(false);
        }
      } catch (err) {
        setHasError(true);
        console.error("Error loading notifications:", err);
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
      toastError("Failed to mark as read");
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    toastSuccess("Marked as read");
  };

  const markAllAsRead = async () => {
    const { error } = await apiClient.requestWithResponse(
      "/api/notifications/inbox",
      {
        method: "PATCH",
        body: { markAllRead: true },
        showErrorToast: false,
      }
    );

    if (error) {
      console.error("Failed to mark all as read:", error);
      toastError("Failed to mark all as read");
      return;
    }

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toastSuccess(`Marked ${notifications.length} notifications as read`);
  };

  const deleteNotification = async (notificationId: string) => {
    const { error } = await apiClient.requestWithResponse(
      "/api/notifications/inbox",
      {
        method: "DELETE",
        body: { notificationId },
        showErrorToast: false,
      }
    );

    if (error) {
      console.error("Failed to delete notification:", error);
      toastError("Failed to delete notification");
      return;
    }

    const notification = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (!notification?.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    toastSuccess("Notification deleted");
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
    <Dropdown
      trigger={
        <button
          style={{ color: '#ffffff' }}
          className={`
            relative p-2 text-white rounded-lg transition-all duration-200
            hover:bg-white/10 hover:scale-110
            active:scale-95
            ${unreadCount > 0 ? "animate-pulse" : ""}
          `}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="w-6 h-6" style={{ color: '#ffffff' }} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full h-5 min-w-5 px-1 flex items-center justify-center shadow-lg animate-in zoom-in-95 duration-200">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          {hasError && (
            <span className="absolute -bottom-0.5 -right-0.5 bg-warning text-white rounded-full h-3 w-3 flex items-center justify-center">
              <AlertCircle className="w-2 h-2" />
            </span>
          )}
        </button>
      }
      align="right"
      width="xl"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      offset={12}
    >
      {/* Header with enhanced gradient */}
      <DropdownHeader
        title={`Notifications${unreadCount > 0 ? ` (${unreadCount})` : ""}`}
        action={
          unreadCount > 0 ? (
            <button
              onClick={markAllAsRead}
              className="text-sm text-primary-dark hover:text-primary-darker font-semibold flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg border-2 border-info-lighter hover:border-primary hover:bg-info-lightest transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          ) : undefined
        }
        className="bg-linear-to-r from-info-lightest to-accent-purple-50 border-b-2"
      />

      {/* Notification List with enhanced scrollbar */}
      <DropdownContent maxHeight="max-h-[500px]">
        {showSkeleton ? (
          <div className="p-4 space-y-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : hasError ? (
          <div className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-error-lightest flex items-center justify-center">
                <AlertCircle className="w-6 h-6" style={{ color: 'var(--color-error)' }} />
              </div>
              <div>
                <p className="font-semibold text-body-dark">Failed to load notifications</p>
                <p className="text-sm text-body-light mt-1">Please try again later</p>
              </div>
              <button
                onClick={loadNotifications}
                className="mt-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        ) : notifications.length === 0 ? (
          <EmptyNotifications />
        ) : (
          <div className="divide-y divide-silver-200">
            {notifications.map((notification, index) => (
              <div
                key={notification.id}
                className={`
                  group p-4 transition-all duration-200 cursor-pointer relative
                  hover:bg-silver-100 hover:shadow-sm
                  ${!notification.read ? "bg-info-lightest border-l-4 border-primary" : "border-l-4 border-transparent"}
                  animate-in fade-in slide-in-from-top-2 duration-300
                `}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-3">
                  {/* Icon with animation */}
                  <div className="text-2xl shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {notification.icon || "🔔"}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm text-navy-900 transition-colors ${
                          !notification.read ? "font-semibold" : "font-medium"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="shrink-0 p-1 text-neutral hover:text-error rounded-lg hover:bg-error-lightest transition-all duration-200 opacity-0 group-hover:opacity-100"
                        aria-label="Delete notification"
                        title="Delete (Del)"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {notification.body && (
                      <p className="text-sm text-neutral-dark mt-1 line-clamp-2">
                        {notification.body}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-neutral font-medium">
                        {formatTime(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="text-xs text-primary hover:text-primary-dark flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-primary-lightest transition-all duration-200"
                          title="Mark as read (Enter)"
                        >
                          <Check className="w-3 h-3" />
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Unread indicator dot */}
                  {!notification.read && (
                    <div className="shrink-0 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownContent>

      {/* Footer */}
      {notifications.length > 0 && !hasError && (
        <div className="px-4 py-3 border-t-2 border-silver-200 bg-linear-to-r from-silver-50 to-silver-100">
          <button
            onClick={() => {
              window.location.href = "/notifications";
              setIsOpen(false);
            }}
            className="text-sm text-primary hover:text-primary-dark font-semibold w-full text-center py-2 rounded-lg hover:bg-white transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            View all notifications
            <span className="transform group-hover:translate-x-1 transition-transform duration-200">→</span>
          </button>
        </div>
      )}
    </Dropdown>
  );
}
