"use client";

import React from "react";
import { Database, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PipelineHealthProps {
  lastSyncTime: string;
  onOpenDiagnostics: () => void;
}

export function PipelineHealth({ lastSyncTime, onOpenDiagnostics }: PipelineHealthProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <Database className="w-4 h-4 text-primary" />
          Data Pipeline Health
        </h3>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-700 bg-emerald-500/10 border border-emerald-500/20">
          Healthy
        </span>
      </div>

      {/* Schematic diagram flow */}
      <div className="p-3 bg-muted/30 rounded-xl border border-border text-xs space-y-3 font-mono">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-foreground">Neon PostgreSQL</span>
          </div>
          <span className="text-muted-foreground text-[10px]">Source</span>
        </div>

        <div className="flex justify-center py-1">
          <div className="h-6 w-0.5 border-r-2 border-dashed border-border relative">
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-foreground">Fivetran Sync</span>
          </div>
          <span className="text-muted-foreground text-[10px]">Pipeline</span>
        </div>

        <div className="flex justify-center py-1">
          <div className="h-6 w-0.5 border-r-2 border-dashed border-border relative">
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-90" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold text-foreground">Google BigQuery</span>
          </div>
          <span className="text-muted-foreground text-[10px]">Destination</span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2.5 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pipeline Latency:</span>
          <span className="font-semibold text-foreground font-mono">1.2 seconds</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Last Synced Data:</span>
          <span className="font-semibold text-foreground font-mono">{lastSyncTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Connector Status:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> Active
          </span>
        </div>
      </div>

      <Button
        onClick={onOpenDiagnostics}
        className="w-full bg-card hover:bg-muted text-foreground font-semibold text-xs py-2 rounded-lg border border-border transition-colors cursor-pointer"
      >
        Check Sync Health
      </Button>
    </div>
  );
}
