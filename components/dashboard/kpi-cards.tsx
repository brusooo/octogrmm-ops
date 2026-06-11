"use client"

import React from "react"
import { AlertCircle, AlertTriangle, Layers, Database } from "lucide-react"

interface KPICardsProps {
  criticalCount: number
  highCount: number
  totalOpenCount: number
  lastSyncTime: string
}

export function KPICards({
  criticalCount,
  highCount,
  totalOpenCount,
  lastSyncTime,
}: KPICardsProps) {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* KPI 1: Critical Alerts */}
      <div className="relative flex items-start justify-between overflow-hidden rounded-2xl border border-destructive/20 bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Critical Alerts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-destructive">
              {criticalCount}
            </span>
            <span className="text-xs font-medium text-destructive/90">
              Immediate Action
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-destructive" />
      </div>

      {/* KPI 2: High Priority Alerts */}
      <div className="relative flex items-start justify-between overflow-hidden rounded-2xl border border-amber-500/20 bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            High Priority Alerts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-amber-600 dark:text-amber-500">
              {highCount}
            </span>
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              Resolution Pending
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600 dark:text-amber-500">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-amber-500" />
      </div>

      {/* KPI 3: Open Alerts */}
      <div className="relative flex items-start justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Open Alerts
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-foreground">
              {totalOpenCount}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              Active Monitors
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-muted p-2 text-muted-foreground">
          <Layers className="h-5 w-5" />
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
      </div>

      {/* KPI 4: Last Data Sync */}
      <div className="relative flex items-start justify-between overflow-hidden rounded-2xl border border-emerald-500/20 bg-card p-5 shadow-sm transition-all hover:shadow-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Last Data Sync
          </span>
          <div className="flex items-baseline gap-2">
            <span className="inline-block max-w-[130px] truncate font-mono text-xl font-bold text-emerald-600 dark:text-emerald-500">
              {lastSyncTime}
            </span>
            <span className="inline-block rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              OK
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-500">
          <Database className="h-5 w-5" />
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-emerald-500" />
      </div>
    </section>
  )
}
