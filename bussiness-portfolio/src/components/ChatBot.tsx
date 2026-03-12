"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage } from "./LanguageProvider";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("fail");

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages([...newMessages, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages([
          ...newMessages,
          { role: "assistant", content: assistantContent },
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "抱歉，暂时无法回复，请稍后再试。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative tooltip-wrapper">
          {!open && <span className="tooltip">{t.chatbot.tooltip}</span>}
          <button
            onClick={() => setOpen(!open)}
            className="w-14 h-14 rounded-full shadow-lg shadow-accent/30 flex items-center justify-center transition-all duration-300 hover:scale-105 overflow-hidden border-2 border-accent/50"
            aria-label="AI Chat"
          >
            {open ? (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : (
              <Image
                src="/images/chatbot-robot.png"
                alt="AI Chat"
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            )}
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[520px] bg-bg-card-solid border border-line rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in backdrop-blur-xl">
          {/* Header */}
          <div className="px-4 py-3 border-b border-line flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <Image
                src="/images/chatbot-robot.png"
                alt="AI"
                width={32}
                height={32}
                className="w-full h-full object-cover"
                unoptimized
              />
            </div>
            <div>
              <p className="text-sm font-semibold">{t.chatbot.title}</p>
              <p className="text-xs text-text-muted">{t.chatbot.subtitle}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[300px]">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-text-muted text-center py-2">
                  {t.chatbot.welcome}
                </p>
                <div className="space-y-2">
                  {t.chatbot.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left text-sm bg-bg-tag hover:bg-accent/10 text-text-muted hover:text-accent px-3 py-2 rounded-lg border border-line hover:border-accent/30 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-sm"
                      : "bg-bg-tag text-text rounded-bl-sm"
                  }`}
                >
                  {msg.content || (loading && i === messages.length - 1 ? (
                    <span className="inline-flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  ) : "")}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-line">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t.chatbot.placeholder}
                disabled={loading}
                className="flex-1 bg-bg text-text text-sm px-3 py-2 rounded-lg border border-line focus:border-accent focus:outline-none placeholder:text-text-muted disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white px-3 py-2 rounded-lg text-sm transition-colors"
              >
                {t.chatbot.send}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
