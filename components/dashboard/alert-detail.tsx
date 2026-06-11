"use client";

import React from "react";
import { Sliders, X, FileText, Activity, Sparkles, Check, CheckCircle2, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";

type AlertSeverity = "Critical" | "High" | "Medium" | "Info";
type AlertType = "Supply Chain" | "Staffing" | "Operations" | "Financial";
type AlertStatus = "Open" | "Actioned" | "Dismissed";

interface Alert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  detailedDescription: string;
  status: AlertStatus;
  createdAt: string;
  recommendation: string;
  actionTakenText?: string;
  impactMetric?: string;
  department: string;
}

interface AlertDetailProps {
  alert: Alert | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onDismiss: (id: string) => void;
}

export function AlertDetail({ alert, onClose, onApprove, onDismiss }: AlertDetailProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col min-h-[420px] transition-all">
      <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-primary" />
          AI Resolution Panel
        </div>
        {alert && (
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!alert ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
          <FileText className="w-12 h-12 stroke-[1.2] text-muted-foreground/30 mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Select an Alert</h3>
          <p className="text-xs leading-relaxed max-w-[240px]">
            Click "Review" on any item in the operations table to view real-time data analyses, clinical impacts, and issue resolutions.
          </p>
        </div>
      ) : (
        <div className="flex-1 p-5 flex flex-col justify-between space-y-6">
          {/* Detail content */}
          <div className="space-y-4">
            {/* Metadata headers */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded tracking-wide ${
                  alert.severity === "Critical"
                    ? "bg-destructive/10 text-destructive"
                    : alert.severity === "High"
                    ? "bg-amber-500/15 text-amber-700 dark:text-amber-500"
                    : "bg-blue-500/10 text-blue-700 dark:text-blue-400"
                }`}>
                  {alert.severity} Priority
                </span>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded uppercase">
                  {alert.type}
                </span>
              </div>
              <h3 className="text-base font-bold text-foreground leading-tight">
                {alert.title}
              </h3>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 font-medium">
                <span>Dept: <span className="font-semibold text-foreground">{alert.department}</span></span>
                <span className="font-mono text-muted-foreground/80">{alert.createdAt}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 space-y-3">
              {/* Detailed logs */}
              <div className="space-y-1">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Impact Analysis</h4>
                <p className="text-xs text-muted-foreground leading-relaxed font-normal bg-muted/20 p-2.5 rounded-lg border border-border">
                  {alert.detailedDescription}
                </p>
              </div>

              {/* Dynamic metrics bar */}
              {alert.impactMetric && (
                <div className="flex items-center gap-2 text-xs bg-primary/5 text-foreground p-2.5 rounded-lg border border-primary/10">
                  <Activity className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-semibold text-muted-foreground">Operational Metric:</span>
                  <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                    {alert.impactMetric}
                  </span>
                </div>
              )}

              {/* Graphics representation */}
              {alert.id === "alt-001" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">Insulin Stock Depletion</span>
                    <span className="font-bold text-destructive">10% Capacity Remaining</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border">
                    <div className="bg-destructive h-full w-[10%] animate-pulse" />
                  </div>
                </div>
              )}

              {alert.id === "alt-002" && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground font-medium">Vancomycin Safety Stock</span>
                    <span className="font-bold text-amber-600 dark:text-amber-500">28% (Safety threshold 40%)</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border">
                    <div className="bg-amber-500 h-full w-[28%]" />
                  </div>
                </div>
              )}

              {alert.id === "alt-005" && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] items-center font-medium">
                    <span className="text-muted-foreground">Cardiology Billed Revenue Drop</span>
                    <span className="font-bold text-destructive flex items-center gap-0.5 font-mono">
                      <TrendingDown className="w-3.5 h-3.5" /> -15%
                    </span>
                  </div>
                  {/* SVG Sparkline */}
                  <div className="bg-muted/30 p-2.5 rounded-lg border border-border flex items-center justify-between gap-4">
                    <span className="text-[10px] text-muted-foreground font-semibold font-mono">30-day Trend</span>
                    <svg className="w-32 h-6 flex-shrink-0" viewBox="0 0 100 30">
                      <path 
                        d="M0,5 L10,6 L20,3 L30,8 L40,6 L50,14 L60,11 L70,22 L80,19 L90,26 L100,28" 
                        fill="none" 
                        stroke="var(--destructive)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* AI Recommendation */}
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Recommended Resolution
                </div>
                <div className="bg-primary/5 text-foreground text-xs p-3.5 rounded-xl border border-primary/10 leading-relaxed font-medium">
                  {alert.recommendation}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-border space-y-3.5">
            {alert.status === "Open" ? (
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => onApprove(alert.id)}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-200 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Approve Recommended Action
                </Button>
                <Button
                  onClick={() => onDismiss(alert.id)}
                  className="w-full bg-card hover:bg-muted text-muted-foreground hover:text-foreground font-bold text-xs py-2.5 rounded-lg border border-border flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  Dismiss Alert
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20 flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Status: {alert.status} ({alert.actionTakenText})
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
