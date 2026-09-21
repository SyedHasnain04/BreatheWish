"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "@/types";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  entity_id: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const user = session?.user as SessionUser | undefined;
  const userId = user?.id;

  const fetchNotifs = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/proxy/notifications/${userId}`);
      if (res.ok) setNotifs(await res.json());
    } catch {
      /* silent */
    }
  }, [userId]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // Close on outside click or Escape key
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const unreadCount = notifs.filter((n) => !n.is_read).length;

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/proxy/notifications/${id}/read`, { method: "PATCH" });
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {
      /* silent */
    }
  };

  const markAllRead = async () => {
    try {
      await Promise.all(
        notifs
          .filter((n) => !n.is_read)
          .map((n) => fetch(`/api/proxy/notifications/${n.id}/read`, { method: "PATCH" }))
      );
      setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      /* silent */
    }
  };

  const handleClick = (notif: Notification) => {
    markRead(notif.id);
    setOpen(false);
    if (notif.entity_id) {
      const role = user?.role;
      if (role === "doctor") {
        router.push(`/doctor/case/${notif.entity_id}`);
      } else {
        router.push(`/patient/case/${notif.entity_id}`);
      }
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-doctor-accent"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-severe-soft rounded-full" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notification center"
          className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl shadow-black/30 z-50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-raised/40">
            <span className="font-semibold text-text-primary text-xs uppercase tracking-wider font-mono">
              Notifications
            </span>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-doctor-accent hover:underline flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 6 7 17l-5-5" />
                    <path d="m22 10-7.5 7.5L13 16" />
                  </svg>
                  <span>Mark all read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close notifications"
                className="text-text-muted hover:text-text-primary p-0.5 rounded"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {notifs.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-xs">
                No notifications right now.
              </div>
            ) : (
              notifs.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-surface-raised transition-colors ${
                    !n.is_read ? "bg-background/40" : ""
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {!n.is_read ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-doctor-accent mt-1.5 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-text-primary leading-snug truncate">
                        {n.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 leading-snug line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[10px] font-mono tabular text-text-muted/70 mt-1">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
