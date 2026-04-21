import React, { useEffect, useRef, useState, useCallback } from "react";

const STORAGE_KEY = "siteChatMessages";

function loadMessages() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // quota exceeded or private mode — silently ignore
  }
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

const cannedReply = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes("upload") || lower.includes("image") || lower.includes("carousel"))
    return "To update hero images, go to Admin → Carousel Editor where you can upload images and captions.";
  if (lower.includes("cart") || lower.includes("checkout"))
    return "Your cart is in the top-right corner. Click the cart icon to view items and proceed to checkout.";
  if (lower.includes("order") || lower.includes("track"))
    return "You can track your order from your account dashboard under 'My Orders'.";
  if (lower.includes("return") || lower.includes("refund"))
    return "We offer returns within 14 days of delivery. Contact support via WhatsApp to start a return.";
  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey"))
    return "Hi there! 👋 How can I help you today? You can ask about products, orders, or anything on the site.";
  return "I can help with products, orders, returns, or site navigation. Try asking something like 'How do I track my order?'";
};

const callApiIfConfigured = async (text) => {
  if (typeof window === "undefined") return null;
  const endpoint = localStorage.getItem("aiEndpoint");
  if (!endpoint) return null;
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    if (data?.reply) return data.reply;
    if (typeof data === "string") return data;
    return null;
  } catch {
    return null;
  }
};

// Animated typing dots
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(loadMessages);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Persist messages
  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, sending]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    const userMsg = {
      id: `${Date.now()}u`,
      role: "user",
      text,
      time: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);

    const apiReply = await callApiIfConfigured(text);
    const replyText = apiReply ?? cannedReply(text);

    setTimeout(() => {
      const botMsg = {
        id: `${Date.now()}b`,
        role: "bot",
        text: replyText,
        time: new Date().toISOString(),
      };
      setMessages((m) => [...m, botMsg]);
      setSending(false);
    }, 600 + Math.min(800, text.length * 18));
  }, [input, sending]);

  const clearChat = () => {
    setMessages([]);
    if (typeof window !== "undefined") {
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed right-5 bottom-5 z-50 flex flex-col items-end gap-3">

      {/* Chat panel */}
      {open && (
        <div className="w-80 md:w-[360px] bg-white rounded-2xl shadow-xl border border-gray-100 flex flex-col overflow-hidden"
          style={{ maxHeight: "min(520px, calc(100vh - 100px))" }}
        >
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.37 5.07L2 22l4.93-1.37A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-medium text-sm leading-none">Assistant</p>
                <p className="text-green-100 text-xs mt-0.5">
                  {sending ? "Typing…" : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="text-xs text-white/80 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Clear chat"
              >
                Clear
              </button>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 text-white transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 py-3 space-y-3 bg-gray-50"
            style={{ minHeight: 0 }}
          >
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium">How can I help you?</p>
                <p className="text-xs text-gray-400 mt-1">Ask about products, orders, or the site.</p>
              </div>
            )}

            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col gap-0.5 ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`px-3.5 py-2.5 max-w-[82%] text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-green-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
                <span className="text-[10px] text-gray-400 px-1">{formatTime(m.time)}</span>
              </div>
            ))}

            {sending && <TypingIndicator />}
          </div>

          {/* Input */}
          <div className="px-3 py-2.5 border-t border-gray-100 bg-white flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-green-500 transition-colors placeholder:text-gray-400 disabled:opacity-60"
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="w-9 h-9 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </button>
    </div>
  );
}