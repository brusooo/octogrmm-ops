"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";
import { Send, RefreshCw, HelpCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface AskOctogramSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AskOctogramSheet({ isOpen, onClose }: AskOctogramSheetProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Hello! I am Octogram AI. Ask me questions about active inventory stockouts, schedule conflicts, lab latencies, or pending billing pre-authorizations."
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Example prompts requested
  const SUGGESTIONS = [
    "Which alerts need attention first?",
    "Why is insulin flagged?",
    "Show unresolved high priority alerts",
    "What changed after the last sync?"
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isSending) return;

    setMessages(prev => [...prev, { sender: "user", text: textToSend }]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });

      if (!response.ok) {
        throw new Error("Failed to reach operations chat API");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { sender: "bot", text: data.response || "No response received." }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: `Error: ${err.message || "Failed to process question."}` }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full max-w-[90vw] sm:w-[520px] sm:max-w-[520px] bg-card border-l border-border shadow-xl flex flex-col h-full text-foreground p-0 gap-0">
        
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border flex flex-row items-center gap-2 flex-shrink-0">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <MessageSquare className="w-4 h-4" />
          </div>
          <SheetTitle className="text-base font-bold text-foreground flex items-center gap-1.5">
            Ask Octogram
          </SheetTitle>
        </SheetHeader>

        {/* Chat Thread area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-thin">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-primary/10 text-foreground border border-primary/20 rounded-tr-none"
                    : "bg-muted text-foreground border border-border rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isSending && (
            <div className="flex items-center gap-1.5 text-muted-foreground italic pl-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
              <span>Octogram AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions chips */}
        <div className="px-6 pb-3 pt-1 border-t border-border bg-muted/10 flex-shrink-0 space-y-2">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <HelpCircle className="w-3.5 h-3.5 text-primary" />
            Suggested Queries
          </div>
          <div className="flex flex-col gap-1.5">
            {SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                disabled={isSending}
                className="w-full text-left px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 border border-border rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="p-6 border-t border-border flex items-center gap-2 flex-shrink-0 bg-muted/30"
        >
          <input
            type="text"
            placeholder="Ask a question about operations..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isSending}
            className="flex-1 px-3 py-2.5 border border-border rounded-xl text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary bg-card text-foreground placeholder:text-muted-foreground/60 disabled:opacity-50"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold p-2.5 rounded-xl cursor-pointer disabled:opacity-50 h-10 w-10 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

      </SheetContent>
    </Sheet>
  );
}
