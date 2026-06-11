"use client";

import React from "react";
import { Activity, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  lastSyncTime: string;
  onOpenChat: () => void;
  onOpenDiagnostics: () => void;
}

export function Header({
  lastSyncTime,
  onOpenChat,
  onOpenDiagnostics
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-card/85 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex flex-col sm:flex-row items-start sm:items-center justify-between py-4 sm:py-0 gap-3">
        {/* Logo & Product Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-sm shadow-primary/20">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Octogram</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full uppercase">
                AI Operations
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium">AI Hospital Operations Monitor</p>
          </div>
        </div>

        {/* Sync, Chat & Diagnostics Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2 bg-muted px-3 py-1.5 rounded-lg border border-border text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-foreground">Data Fresh</span>
            <span className="text-muted-foreground/50">|</span>
            <span className="text-muted-foreground font-mono">Synced {lastSyncTime}</span>
          </div>

          <Button
            onClick={onOpenDiagnostics}
            variant="outline"
            className="border-border text-foreground hover:bg-muted font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-200"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            Check Sync Health
          </Button>

          <Button
            onClick={onOpenChat}
            variant="outline"
            className="border-border text-foreground hover:bg-muted font-medium text-xs px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all duration-200"
          >
            <MessageSquare className="w-3.5 h-3.5 text-primary" />
            Ask Octogram
          </Button>
        </div>
      </div>
    </header>
  );
}
