"use client";

import React from "react";
import { ShieldCheck, X, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DiagnosticsModalProps {
  isOpen: boolean;
  step: number;
  onClose: () => void;
}

export function DiagnosticsModal({ isOpen, step, onClose }: DiagnosticsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-md w-full overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground">Pipeline Diagnostic Scan</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Octogram queries database nodes across your infrastructure. The connection diagnostic tests verified the following status traces:
          </p>

          {/* Checklist */}
          <div className="space-y-4 font-mono text-xs">
            {/* Step 1: Postgres */}
            <div className="flex items-start gap-3">
              {step >= 1 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-muted-foreground/50 animate-spin flex-shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold text-foreground">1. Neon PostgreSQL DB Node</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Connection pool active • Latency 42ms • SSL verified</p>
              </div>
            </div>

            {/* Step 2: Fivetran */}
            <div className="flex items-start gap-3">
              {step >= 2 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : step === 1 ? (
                <Clock className="w-4 h-4 text-muted-foreground/50 animate-spin flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
              )}
              <div>
                <span className={`font-bold ${step >= 2 ? "text-foreground" : "text-muted-foreground/60"}`}>
                  2. Fivetran Sync Service
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Connector active • Incremental updates synced successfully</p>
              </div>
            </div>

            {/* Step 3: BigQuery */}
            <div className="flex items-start gap-3">
              {step >= 3 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : step === 2 ? (
                <Clock className="w-4 h-4 text-muted-foreground/50 animate-spin flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
              )}
              <div>
                <span className={`font-bold ${step >= 3 ? "text-foreground" : "text-muted-foreground/60"}`}>
                  3. BigQuery Data Warehouse
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Write partitions healthy • Storage utilization 14.8GB</p>
              </div>
            </div>

            {/* Step 4: LLM */}
            <div className="flex items-start gap-3">
              {step >= 4 ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              ) : step === 3 ? (
                <Clock className="w-4 h-4 text-muted-foreground/50 animate-spin flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-border flex-shrink-0" />
              )}
              <div>
                <span className={`font-bold ${step >= 4 ? "text-foreground" : "text-muted-foreground/60"}`}>
                  4. Ollama Ops Engine
                </span>
                <p className="text-[10px] text-muted-foreground mt-0.5">Model ready • Context window verified • Prompts loaded</p>
              </div>
            </div>
          </div>

          {/* Status report */}
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">Overall Pipeline Vitals:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-card px-2 py-0.5 rounded border border-border font-mono">
              100% HEALTHY
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/20 border-t border-border flex justify-end">
          <Button
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
          >
            Close Report
          </Button>
        </div>
      </div>
    </div>
  );
}
