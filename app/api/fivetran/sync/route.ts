import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const apiKey = process.env.FIVETRAN_API_KEY;
  const apiSecret = process.env.FIVETRAN_API_SECRET;
  const connectorId = process.env.FIVETRAN_CONNECTOR_ID;

  if (!apiKey || !apiSecret || !connectorId) {
    console.warn("Fivetran environment variables missing. Running in demo mock sync mode.");
    return NextResponse.json({
      code: "Success",
      message: "Sync triggered successfully (Demo Mock Mode)",
      data: {
        connector_id: connectorId || "mock_connector_123",
        status: "syncing"
      }
    });
  }

  try {
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const response = await fetch(`https://api.fivetran.com/v1/connectors/${connectorId}/sync`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ force: true })
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Fivetran Sync API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to trigger Fivetran sync" },
      { status: 500 }
    );
  }
}
