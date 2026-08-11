"use client";

import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";

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

export default function ConsultationThread({ caseId, currentUserRole, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/proxy/consultations/${caseId}`);
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (e) { /* silent */ }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, [caseId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      await fetch(`/api/proxy/consultations/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, message: newMessage.trim() })
      });
      setNewMessage("");
      await fetchMessages();
    } catch (e) { /* silent */ }
    setSending(false);
  };

  const isPatient = currentUserRole === "patient";
  const bubbleOwn = isPatient ? "bg-patient-accent text-white self-end" : "bg-doctor-accent text-white self-end";
  const bubbleOther = "bg-gray-100 text-text-dark self-start";

  return (
    <div className={`rounded-xl border shadow-sm flex flex-col overflow-hidden ${isPatient ? "border-patient-border" : "border-border bg-surface"}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b font-semibold text-sm ${isPatient ? "bg-patient-surface border-patient-border text-text-dark" : "bg-[#1E293B] border-border text-text-primary"}`}>
        Consultation Thread
      </div>

      {/* Messages */}
      <div className={`flex-1 min-h-[250px] max-h-[350px] overflow-y-auto p-4 flex flex-col gap-3 ${isPatient ? "bg-patient-bg" : "bg-[#0F172A]"}`}>
        {messages.length === 0 && (
          <p className={`text-center text-sm my-auto ${isPatient ? "text-text-dark-muted" : "text-text-muted"}`}>
            No messages yet. Ask your {isPatient ? "doctor" : "patient"} a question.
          </p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.sender_role === currentUserRole;
          return (
            <div key={msg.id} className={`max-w-[80%] flex flex-col gap-1 ${isOwn ? "self-end items-end" : "self-start items-start"}`}>
              {!isOwn && msg.sender_name && (
                <span className="text-xs text-gray-400 px-1">{msg.sender_name}</span>
              )}
              <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn ? bubbleOwn : bubbleOther}`}>
                {msg.message}
              </div>
              <span className="text-[10px] text-gray-400 px-1">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className={`flex items-center gap-3 px-4 py-3 border-t ${isPatient ? "bg-patient-surface border-patient-border" : "bg-[#1E293B] border-border"}`}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className={`flex-1 rounded-lg px-4 py-2 text-sm border outline-none focus:ring-2 ${
            isPatient
              ? "bg-white border-patient-border focus:ring-patient-accent/30 text-text-dark"
              : "bg-[#0F172A] border-border focus:ring-doctor-accent/30 text-text-primary"
          }`}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !newMessage.trim()}
          className={`p-2.5 rounded-lg disabled:opacity-40 transition-colors ${
            isPatient ? "bg-patient-accent hover:bg-teal-700 text-white" : "bg-doctor-accent hover:bg-sky-500 text-white"
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
