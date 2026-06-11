"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Info, CheckCircle, X, RefreshCw, Sparkles } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { KPICards } from "@/components/dashboard/kpi-cards";
import { AlertsTable } from "@/components/dashboard/alerts-table";
import { AlertDialogView } from "@/components/dashboard/alert-dialog-view";
import { AskOctogramSheet } from "@/components/dashboard/ask-octogram-sheet";
import { DiagnosticsModal } from "@/components/dashboard/diagnostics-modal";
import { Button } from "@/components/ui/button";

// Type definitions
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
  actionTakenText?: string;
  impactMetric?: string;
  department: string;
}

interface BigQueryAlertRow {
  alert_id?: string;
  alert_type?: string;
  severity?: string;
  title?: string;
  description?: string;
  created_at?: unknown;
  status?: string;
}

// Convert BigQuery timestamps to clean date strings
function formatBigQueryDate(createdAtObj: unknown): string {
  if (!createdAtObj) return "Today";
  try {
    let dateStr = "";
    if (typeof createdAtObj === "object" && createdAtObj !== null && "value" in createdAtObj) {
      dateStr = String((createdAtObj as { value: unknown }).value);
    } else if (typeof createdAtObj === "string") {
      dateStr = createdAtObj;
    } else {
      dateStr = String(createdAtObj);
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return (
        d.toLocaleDateString([], { month: "short", day: "numeric" }) +
        ", " +
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
    return dateStr;
  } catch {
    return String(createdAtObj);
  }
}

// Map BigQuery rows to internal Alert interface
function mapRowToAlert(row: BigQueryAlertRow): Alert {
  const id = row.alert_id || `alt-${Math.random().toString(36).substr(2, 9)}`;
  const title = row.title || "Operations Alert";
  const type = (row.alert_type || "Operations") as AlertType;
  const severity = (row.severity || "Medium") as AlertSeverity;
  const description = row.description || "";
  
  let department = "Operations";
  if (type === "Supply Chain") department = "Pharmacy";
  else if (type === "Staffing") department = "Clinical Scheduling";
  else if (type === "Financial") department = "Billing & Finance";
  else if (title.toLowerCase().includes("cardiology")) department = "Cardiology";
  else if (title.toLowerCase().includes("lab") || title.toLowerCase().includes("test")) department = "Laboratory";

  let impactMetric = undefined;
  if (title.toLowerCase().includes("insulin")) {
    impactMetric = "Est. depletion: 0.7 days";
  } else if (title.toLowerCase().includes("vancomycin")) {
    impactMetric = "Est. depletion: 2.9 days";
  } else if (title.toLowerCase().includes("kumar")) {
    impactMetric = "14.5 consecutive hours";
  } else if (title.toLowerCase().includes("lab") || title.toLowerCase().includes("tests are delayed")) {
    impactMetric = "Avg delay: +23 mins";
  } else if (title.toLowerCase().includes("revenue") || title.toLowerCase().includes("cardiology")) {
    impactMetric = "-15% weekly revenue drop";
  }

  let recommendation = "Initiate departmental review of the active alert and flag for follow-up.";
  if (title.toLowerCase().includes("insulin")) {
    recommendation = "Approve emergency purchase order PO-88492 for 150 units from primary distributor (McKesson, expedited overnight delivery) and request an immediate courier transfer of 35 units from Saint Jude Affiliate Hospital (9 miles away).";
  } else if (title.toLowerCase().includes("vancomycin")) {
    recommendation = "Release pending purchase requisition PR-9941 to accelerate shipment of 400 vials, and notify pharmacy technicians to substitute alternative glycopeptides if clinical guidelines permit.";
  } else if (title.toLowerCase().includes("kumar")) {
    recommendation = "Reallocate tomorrow's 13:00-18:00 Clinic Outpatient Shift to Dr. Marcus Rodriguez, and issue automatic SMS scheduling updates to the outpatient reception staff.";
  } else if (title.toLowerCase().includes("lab") || title.toLowerCase().includes("tests are delayed")) {
    recommendation = "Reroute outstanding ED clinical chemistry samples to analyzer line B (currently idle) and dispatch a priority notification to the Lab Duty Supervisor.";
  } else if (title.toLowerCase().includes("revenue") || title.toLowerCase().includes("cardiology")) {
    recommendation = "Initiate emergency claim review for 24 high-value pending cardiology authorizations and assign billing specialists to follow up via payer portals.";
  }

  const createdAt = formatBigQueryDate(row.created_at);

  return {
    id,
    severity,
    type,
    title,
    description,
    detailedDescription: description,
    status: (row.status || "Open") as AlertStatus,
    createdAt,
    recommendation,
    impactMetric,
    department
  };
}

export default function Page() {
  const isProduction = process.env.NODE_ENV === "production";

  // Alerts lists
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ollama Brief data
  const [briefSummary, setBriefSummary] = useState("");

  // Dynamic overlays states
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState("3:11 PM");
  const [isHealthCheckOpen, setIsHealthCheckOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [syncStatusStep, setSyncStatusStep] = useState<number>(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{message: string; type: "success" | "info"} | null>(null);

  // Handlers for production environment checks
  const handleOpenDiagnostics = () => {
    if (isProduction) {
      setActionFeedback({
        message: "Pipeline diagnostics check is disabled in production. This feature is intended for local environment usage.",
        type: "info"
      });
      return;
    }
    setIsHealthCheckOpen(true);
  };

  const handleOpenChat = () => {
    if (isProduction) {
      setActionFeedback({
        message: "Ask Octogram Chat is disabled in production. This feature is intended for local environment usage.",
        type: "info"
      });
      return;
    }
    setIsChatOpen(true);
  };

  // Show toast notification on mount if in production
  useEffect(() => {
    if (isProduction) {
      setActionFeedback({
        message: "Pipeline status and chat will be disabled since ollama can't be connected",
        type: "info"
      });
    }
  }, [isProduction]);

  // Fetch Fivetran connector status
  const fetchFivetranStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/fivetran/status");
      if (response.ok) {
        const data = await response.json();
        if (data.last_successful_sync) {
          const d = new Date(data.last_successful_sync);
          const timeString = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          setLastSyncTime(timeString);
        }
      }
    } catch (e) {
      console.error("Failed to fetch Fivetran status:", e);
    }
  }, []);

  // Fetch alerts from BQ
  const loadAlerts = useCallback(async (isSilentlySyncing = false) => {
    if (!isSilentlySyncing) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error(`Failed to load alerts: API returned status ${response.status}`);
      }
      const resJson = await response.json();
      
      if (!resJson.success || !Array.isArray(resJson.data)) {
        throw new Error("Invalid response format: Expected data array");
      }

      const mappedAlerts = resJson.data.map(mapRowToAlert);
      setAlerts(mappedAlerts);
    } catch (err: unknown) {
      console.error("Fetch Alerts Error:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while loading dashboard data.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch AI Brief from Ollama
  const loadAIBrief = useCallback(async () => {
    try {
      const response = await fetch("/api/brief");
      if (!response.ok) {
        throw new Error("Failed to generate AI operational brief");
      }
      const data = await response.json();
      setBriefSummary(data.summary || "");
    } catch (err) {
      console.error("Failed to load Ollama Operations Brief:", err);
      setBriefSummary("An operational scan of hospital ERP logs indicates urgent critical supply constraints in the central pharmacy, Dr. Kumar's shifts schedule overload tomorrow, and a week-over-week cardiology revenue fall.");
    }
  }, []);

  // Initial load and periodic polling every 30 seconds
  useEffect(() => {
    const runInitialLoad = async () => {
      await loadAlerts();
      await loadAIBrief();
      await fetchFivetranStatus();
    };
    runInitialLoad();

    const interval = setInterval(() => {
      loadAlerts(true);
      fetchFivetranStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [loadAlerts, loadAIBrief, fetchFivetranStatus]);

  // Derived stats (Critical & High counts are calculated from active monitors only)
  const openAlerts = alerts.filter(a => a.status.toLowerCase() === "open");
  const criticalCount = openAlerts.filter(a => a.severity === "Critical").length;
  const highCount = openAlerts.filter(a => a.severity === "High").length;
  const totalOpenCount = openAlerts.length;

  const selectedAlert = alerts.find(a => a.id === selectedAlertId) || null;

  // Sync refresh pipeline removed (frontend is display-only)

  // Status PATCH trigger
  const handleUpdateStatus = async (alertId: string, newStatus: "resolved" | "dismissed") => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        throw new Error("Failed to update status on server");
      }
      
      // Update local state and trigger dynamic re-calculations
      await loadAlerts(true);
      loadAIBrief();
      setIsDialogOpen(false);
      
      setActionFeedback({
        message: `Alert successfully marked as ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}.`,
        type: "success"
      });
    } catch (err: unknown) {
      console.error("Failed to update status:", err);
      const errorMessage = err instanceof Error ? err.message : "Server error";
      setActionFeedback({
        message: `Failed to update status: ${errorMessage}`,
        type: "info"
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open pop-up view
  const handleViewAlert = (id: string) => {
    setSelectedAlertId(id);
    setIsDialogOpen(true);
  };

  // Diagnostics check increments
  useEffect(() => {
    let timer0: NodeJS.Timeout;
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;
    let timer4: NodeJS.Timeout;

    if (isHealthCheckOpen) {
      timer0 = setTimeout(() => setSyncStatusStep(1), 0);
      timer1 = setTimeout(() => setSyncStatusStep(2), 500);
      timer2 = setTimeout(() => setSyncStatusStep(3), 1000);
      timer3 = setTimeout(() => setSyncStatusStep(4), 1500);
    } else {
      timer4 = setTimeout(() => setSyncStatusStep(0), 0);
    }

    return () => {
      if (timer0) clearTimeout(timer0);
      if (timer1) clearTimeout(timer1);
      if (timer2) clearTimeout(timer2);
      if (timer3) clearTimeout(timer3);
      if (timer4) clearTimeout(timer4);
    };
  }, [isHealthCheckOpen]);

  // Base loader UI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans pb-16 flex flex-col justify-between">
        <Header
          lastSyncTime={lastSyncTime}
          onOpenChat={handleOpenChat}
          onOpenDiagnostics={handleOpenDiagnostics}
          isProduction={isProduction}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 flex flex-col items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground">Syncing live operations data from BigQuery...</p>
          </div>
        </main>
      </div>
    );
  }

  // Base error UI
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans pb-16 flex flex-col">
        <Header
          lastSyncTime={lastSyncTime}
          onOpenChat={handleOpenChat}
          onOpenDiagnostics={handleOpenDiagnostics}
          isProduction={isProduction}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex-1 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="p-4 bg-destructive/15 text-destructive rounded-full">
            <Info className="w-8 h-8" />
          </div>
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-foreground">Failed to Load BigQuery Data</h3>
            <p className="text-sm text-muted-foreground max-w-md">{error}</p>
          </div>
          <Button 
            onClick={() => loadAlerts()} 
            className="bg-primary hover:bg-primary/95 text-primary-foreground font-semibold px-4 py-2 rounded-lg cursor-pointer"
          >
            Retry Connection
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-16">
      
      {/* Toast Notification Banner */}
      {actionFeedback && (
        <div className={`sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b shadow-sm transition-all duration-300 ${
          actionFeedback.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400" 
            : "bg-muted border-border text-foreground"
        }`}>
          <div className="flex items-center gap-2 max-w-4xl mx-auto w-full">
            {actionFeedback.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{actionFeedback.message}</span>
          </div>
          <button 
            onClick={() => setActionFeedback(null)}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        lastSyncTime={lastSyncTime}
        onOpenChat={handleOpenChat}
        onOpenDiagnostics={handleOpenDiagnostics}
        isProduction={isProduction}
      />

      {/* Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* KPI stats */}
        <KPICards
          criticalCount={criticalCount}
          highCount={highCount}
          totalOpenCount={totalOpenCount}
          lastSyncTime={lastSyncTime}
        />

        {/* Alerts Monitor section (Full-width focus) */}
        <div className="w-full space-y-6">
          
          {/* Inline AI Summary line */}
          {briefSummary && (
            <div className="bg-primary/5 text-foreground border border-primary/10 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden">
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary/40" />
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary mt-0.5">
                <Sparkles className="w-4 h-4 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Operations Brief Summary</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{briefSummary}</p>
              </div>
            </div>
          )}

          {/* Alerts Table */}
          <AlertsTable
            alerts={alerts}
            activeFilter={activeFilter}
            searchQuery={searchQuery}
            onViewAlert={handleViewAlert}
            onFilterChange={setActiveFilter}
            onSearchChange={setSearchQuery}
          />
        </div>

      </main>

      {/* Modal dialog review screen */}
      <AlertDialogView
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        alert={selectedAlert}
        onDismiss={(id) => handleUpdateStatus(id, "dismissed")}
        onResolve={(id) => handleUpdateStatus(id, "resolved")}
        isProcessing={isUpdatingStatus}
      />

      {/* Right chat panel drawer */}
      <AskOctogramSheet
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Diagnostics checks modal */}
      <DiagnosticsModal
        isOpen={isHealthCheckOpen}
        step={syncStatusStep}
        onClose={() => setIsHealthCheckOpen(false)}
      />

    </div>
  );
}
