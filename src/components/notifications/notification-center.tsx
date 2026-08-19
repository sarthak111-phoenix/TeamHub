"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, CheckCheck, Check, Clock, AlertCircle } from "lucide-react";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/lib/actions/notifications";

export function NotificationCenter() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);

  const loadNotifications = React.useCallback(async () => {
    const [list, count] = await Promise.all([
      getNotifications(20),
      getUnreadNotificationCount(),
    ]);
    setNotifications(list);
    setUnreadCount(count);
  }, []);

  React.useEffect(() => {
    loadNotifications();
    // Poll for notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Close popover when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen) loadNotifications();
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await markNotificationAsRead(id);
    if (res.success) {
      loadNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    const res = await markAllNotificationsAsRead();
    setIsLoading(false);
    if (res.success) {
      loadNotifications();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Bell Button with Counter */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-hover transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Drawer */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-dark-card border border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden text-xs">
          {/* Drawer Header */}
          <div className="p-3 bg-dark-surface border-b border-dark-border flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-white">
              <Bell className="w-3.5 h-3.5 text-metallic-cyan" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-500/40 text-[10px]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-[11px] text-metallic-cyan hover:underline flex items-center gap-1 font-semibold"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications Scroll List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-dark-border/60">
            {notifications && notifications.length > 0 ? (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 transition-colors flex items-start justify-between gap-2.5 ${
                    n.isRead ? "bg-dark-card opacity-75" : "bg-dark-surface/90 hover:bg-dark-hover"
                  }`}
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-metallic-cyan flex-shrink-0" />
                      )}
                      <span className="font-bold text-white truncate block">{n.title}</span>
                    </div>

                    <p className="text-gray-300 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                      <span className="font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {n.link && (
                        <Link
                          href={n.link}
                          onClick={() => {
                            if (!n.isRead) markNotificationAsRead(n.id);
                            setIsOpen(false);
                          }}
                          className="text-metallic-cyan hover:underline font-semibold"
                        >
                          View →
                        </Link>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="p-1 rounded text-gray-500 hover:text-emerald-400 hover:bg-dark-hover transition-colors flex-shrink-0"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <AlertCircle className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold text-gray-300">No notifications yet</p>
                <p className="text-[11px] text-gray-500 mt-1">
                  Updates on task assignments and project events will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
