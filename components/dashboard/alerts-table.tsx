"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

type AlertSeverity = "Critical" | "High" | "Medium" | "Info";
type AlertType = "Supply Chain" | "Staffing" | "Operations" | "Financial";
type AlertStatus = "Open" | "Actioned" | "Dismissed" | "Resolved";

interface Alert {
  id: string;
  severity: AlertSeverity;
  type: AlertType;
  title: string;
  description: string;
  status: AlertStatus;
  createdAt: string;
  department: string;
}

interface AlertsTableProps {
  alerts: Alert[];
  activeFilter: string;
  searchQuery: string;
  onViewAlert: (id: string) => void;
  onFilterChange: (filter: string) => void;
  onSearchChange: (query: string) => void;
}

export function AlertsTable({
  alerts,
  activeFilter,
  searchQuery,
  onViewAlert,
  onFilterChange,
  onSearchChange
}: AlertsTableProps) {
  // Apply filter tabs and text queries
  const filteredAlerts = alerts.filter(alert => {
    const statusLower = alert.status.toLowerCase();
    const severityLower = alert.severity.toLowerCase();

    if (activeFilter === "Open" && statusLower !== "open") return false;
    if (activeFilter === "Critical" && severityLower !== "critical") return false;
    if (activeFilter === "High" && severityLower !== "high") return false;
    if (activeFilter === "Resolved" && statusLower !== "resolved") return false;
    if (activeFilter === "Dismissed" && statusLower !== "dismissed") return false;
    
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        alert.title.toLowerCase().includes(query) ||
        alert.description.toLowerCase().includes(query) ||
        alert.type.toLowerCase().includes(query) ||
        alert.department.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden w-full">
      {/* Table Header and Search bar */}
      <div className="p-6 pb-4 border-b border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground">Operational Alerts</h2>
          <p className="text-xs text-muted-foreground">Manage active alerts and execute AI actions</p>
        </div>
        
        {/* Search */}
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search alerts..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-1.5 border border-border rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary bg-muted/50 text-foreground placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-6 py-3 bg-muted/30 border-b border-border flex flex-wrap gap-2">
        {["All", "Open", "Critical", "High", "Resolved", "Dismissed"].map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeFilter === filter
                ? "bg-foreground text-background shadow-sm"
                : "bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            }`}
          >
            {filter === "All" ? `All Alerts (${alerts.length})` : filter}
          </button>
        ))}
      </div>

      {/* Alerts Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/10">
              <th className="px-6 py-4">Severity</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Description Preview</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created At</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border text-sm bg-card">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-medium">
                  No alerts match your current filter criteria or search query.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((alert) => (
                <tr
                  key={alert.id}
                  className="group hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onViewAlert(alert.id)}
                >
                  {/* Severity badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ${
                      alert.severity === "Critical"
                        ? "bg-destructive/10 text-destructive border border-destructive/20"
                        : alert.severity === "High"
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-500 border border-amber-500/20"
                        : alert.severity === "Medium"
                        ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}>
                      {alert.severity}
                    </span>
                  </td>

                  {/* Type badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 text-[10px] font-semibold text-muted-foreground bg-muted border border-border rounded uppercase">
                      {alert.type}
                    </span>
                  </td>

                  {/* Title */}
                  <td className="px-6 py-4 font-semibold text-foreground group-hover:text-primary transition-colors max-w-[200px] truncate">
                    {alert.title}
                  </td>

                  {/* Description preview */}
                  <td className="px-6 py-4 text-xs text-muted-foreground font-normal max-w-[250px] truncate">
                    {alert.description}
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded ${
                      alert.status.toLowerCase() === "open"
                        ? "bg-amber-500/10 text-amber-800 dark:text-amber-400"
                        : alert.status.toLowerCase() === "resolved"
                        ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        alert.status.toLowerCase() === "open"
                          ? "bg-amber-500"
                          : alert.status.toLowerCase() === "resolved"
                          ? "bg-emerald-500"
                          : "bg-muted-foreground"
                      }`} />
                      {alert.status}
                    </span>
                  </td>

                  {/* Created At */}
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground font-mono font-medium">
                    {alert.createdAt}
                  </td>

                  {/* View action button */}
                  <td className="px-6 py-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => onViewAlert(alert.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-md cursor-pointer transition-all bg-muted hover:bg-primary/10 hover:text-primary text-foreground border border-border flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
