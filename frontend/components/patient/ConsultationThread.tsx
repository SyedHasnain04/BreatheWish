"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";


interface Message {
  id: string;
  sender_role: "patient" | "doctor";
  sender_name?: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface Props {
  caseId: string;
  currentUserRole: "patient" | "doctor";
  currentUserId: string;
}

export default function ConsultationThread({ caseId, currentUserRole }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/proxy/consultations/${caseId}`);
      if (res.ok) setMessages(await res.json());
    } catch {
      /* silent background fetch error */
    }
  }, [caseId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/proxy/consultations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, message: newMessage.trim() }),
      });
      if (res.ok) {
        setNewMessage("");
        await fetchMessages();
      }
    } catch {
      /* silent */
    }
    setSending(false);
  };

  const isPatient = currentUserRole === "patient";

  return (
    <div
      className={`rounded-xl border shadow-sm flex flex-col overflow-hidden ${
        isPatient
          ? "border-patient-border bg-patient-surface"
          : "border-border bg-surface"
      }`}
    >
      <div
        className={`px-4 py-3 border-b text-xs font-semibold uppercase tracking-wider ${
          isPatient
            ? "bg-patient-bg border-patient-border text-text-dark"
            : "bg-surface-raised border-border text-text-primary"
        }`}
      >
        Clinical Consultation
      </div>

      <div
        className={`flex-1 min-h-[240px] max-h-[340px] overflow-y-auto p-4 flex flex-col gap-3 ${
          isPatient ? "bg-patient-bg/50" : "bg-background"
        }`}
      >
        {messages.length === 0 && (
          <p
            className={`text-center text-xs my-auto ${
              isPatient ? "text-text-dark-muted" : "text-text-muted"
            }`}
          >
            No messages in this consultation yet. Ask a question below.
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_role === currentUserRole;
          return (
            <div
              key={msg.id}
              className={`max-w-[85%] flex flex-col gap-1 ${
                isOwn ? "self-end items-end" : "self-start items-start"
              }`}
            >
              {!isOwn && msg.sender_name && (
                <span
                  className={`text-[11px] px-1 font-medium ${
                    isPatient ? "text-text-dark-muted" : "text-text-muted"
                  }`}
                >
                  {msg.sender_name}
                </span>
              )}
              <div
                className={`px-3.5 py-2 rounded-lg text-xs leading-relaxed ${
                  isOwn
                    ? isPatient
                      ? "bg-patient-accent text-white"
                      : "bg-doctor-accent text-background font-medium"
                    : isPatient
                    ? "bg-white border border-patient-border text-text-dark"
                    : "bg-surface-raised border border-border text-text-primary"
                }`}
              >
                {msg.message}
              </div>
              <span
                className={`text-[10px] font-mono tabular px-1 ${
                  isPatient ? "text-text-dark-muted/70" : "text-text-muted/70"
                }`}
              >
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div
        className={`flex items-center gap-2 p-3 border-t ${
          isPatient
            ? "bg-patient-surface border-patient-border"
            : "bg-surface border-border"
        }`}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Write a message…"
          className={`flex-1 rounded-lg px-3.5 py-2 text-xs border transition-colors outline-none focus:ring-1 ${
            isPatient
              ? "bg-white border-patient-border text-text-dark placeholder:text-text-dark-muted/60 focus:border-patient-accent focus:ring-patient-accent"
              : "bg-background border border-border text-text-primary placeholder:text-text-muted/60 focus:border-doctor-accent focus:ring-doctor-accent"
          }`}
        />
        <button
          type="button"
          aria-label="Send message"
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className={`p-2 rounded-lg disabled:opacity-40 transition-colors flex items-center justify-center ${
            isPatient
              ? "bg-patient-accent hover:opacity-90 text-white"
              : "bg-doctor-accent hover:opacity-90 text-background font-semibold"
          }`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </button>
      </div>
    </div>
  );
}
