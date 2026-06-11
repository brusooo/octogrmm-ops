import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.FIVETRAN_API_KEY;
  const apiSecret = process.env.FIVETRAN_API_SECRET;
  const connectorId = process.env.FIVETRAN_CONNECTOR_ID;

  if (!apiKey || !apiSecret || !connectorId) {
    // Return mock healthy status if environment variables are not yet configured
    const now = new Date();
    // Simulate last successful sync at 3:11 PM local time
    const lastSync = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 11, 0);
    
    return NextResponse.json({
      connector_id: connectorId || "mock_connector_123",
      status: "Healthy",
      last_successful_sync: lastSync.toISOString(),
      last_failed_sync: null,
      sync_frequency: 60,
      setup_state: "connected"
    });
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const response = await fetch(`https://api.fivetran.com/v1/connectors/${connectorId}`, {
      method: "GET",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Fivetran API returned error status: ${response.status}`);
    }

    const res = await response.json();
    const data = res.data || {};
    
    return NextResponse.json({
      connector_id: data.id,
      status: data.status?.sync_state || "Healthy",
      last_successful_sync: data.succeeded_at || null,
      last_failed_sync: data.failed_at || null,
      sync_frequency: data.sync_frequency || 60,
      setup_state: data.setup_state || "connected"
    });
  } catch (error: any) {
    console.error("Fivetran Status API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Fivetran connector status" },
      { status: 500 }
    );
  }
}
