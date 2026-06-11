"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Calendar, AlertCircle, Sparkles, CheckCircle, Trash2, Clock } from "lucide-react";

type AlertSeverity = "Critical" | "High" | "Medium" | "Info";
type AlertType = "Supply Chain" | "Staffing" | "Operations" | "Financial";
type AlertStatus = "Open" | "Actioned" | "Dismissed" | "Resolved";

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
  department: string;
  impactMetric?: string;
}

interface AlertDialogViewProps {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert | null;
  onDismiss: (id: string) => void;
  onResolve: (id: string) => void;
  isProcessing: boolean;
}

export function AlertDialogView({
  isOpen,
  onClose,
  alert,
  onDismiss,
  onResolve,
  isProcessing
}: AlertDialogViewProps) {
  if (!alert) return null;

  const statusLower = alert.status.toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border border-border shadow-xl rounded-2xl overflow-hidden text-foreground">
        <DialogHeader className="space-y-3 pb-3 border-b border-border">
          {/* Metadata badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded tracking-wide ${
              alert.severity === "Critical"
                ? "bg-destructive/10 text-destructive border border-destructive/20"
                : alert.severity === "High"
                ? "bg-amber-500/10 text-amber-700 dark:text-amber-500 border border-amber-500/20"
                : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
            }`}>
              {alert.severity}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded uppercase">
              {alert.type}
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${
              statusLower === "open"
                ? "bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20"
                : statusLower === "resolved"
                ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border-emerald-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}>
              {alert.status}
            </span>
          </div>

          <DialogTitle className="text-base font-bold text-foreground leading-tight">
            {alert.title}
          </DialogTitle>
          
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium pt-0.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
            <span>Logged: <span className="font-mono">{alert.createdAt}</span></span>
            <span className="text-muted-foreground/30">•</span>
            <span>Dept: <span className="font-semibold text-foreground">{alert.department}</span></span>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="space-y-4 py-2">
          {/* Full description */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Impact & Analysis</h4>
            <p className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-3 rounded-lg border border-border">
              {alert.detailedDescription || alert.description}
            </p>
          </div>

          {/* AI resolution advice */}
          {alert.recommendation && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                AI Recommended Action
              </div>
              <div className="bg-primary/5 text-foreground text-xs p-3 rounded-xl border border-primary/10 leading-relaxed font-medium">
                {alert.recommendation}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <DialogFooter className="pt-3 border-t border-border flex flex-row items-center justify-between sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-muted font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
          >
            Close
          </Button>

          {statusLower === "open" && (
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing}
                onClick={() => onDismiss(alert.id)}
                className="border-border text-destructive hover:bg-destructive/5 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Dismiss
              </Button>
              <Button
                type="button"
                disabled={isProcessing}
                onClick={() => onResolve(alert.id)}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark Resolved
              </Button>
            </div>
          )}

          {statusLower !== "open" && (
            <div className="text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Action completed as {alert.status}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
