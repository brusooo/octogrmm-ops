import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";

export const dynamic = "force-dynamic";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req: Request) {
  try {
    // Determine target URL for internal route triggers
    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const baseUrl = `${proto}://${host}`;

    // 1. Trigger Fivetran connector sync
    console.log("Triggering Fivetran sync via internal endpoint...");
    const syncRes = await fetch(`${baseUrl}/api/fivetran/sync`, { method: "POST" });
    const syncData = await syncRes.json();
    console.log("Fivetran sync response:", syncData);

    // 2. Wait 5 seconds
    console.log("Waiting 5 seconds for write propagation...");
    await sleep(5000);

    // 3. Trigger alert generation query
    console.log("Executing BigQuery alert generation query...");
    const genRes = await fetch(`${baseUrl}/api/alerts/generate`, { method: "POST" });
    const genData = await genRes.json();
    console.log("Alerts generation response:", genData);

    if (genRes.status !== 200 || !genData.success) {
      throw new Error(genData.error || "BigQuery alert generation query failed");
    }

    // 4. Retrieve latest alerts directly from BigQuery
    const query = `
      SELECT alert_id, alert_type, severity, title, description, created_at, status
      FROM \`onelinkto.public.alerts\`
      ORDER BY created_at DESC
    `;
    const [alerts] = await bigquery.query({ query });

    return NextResponse.json({
      success: true,
      message: "Latest hospital data synced and alerts updated",
      alerts: alerts
    });
  } catch (error: any) {
    console.error("Refresh pipeline failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to sync and refresh alerts" },
      { status: 500 }
    );
  }
}
