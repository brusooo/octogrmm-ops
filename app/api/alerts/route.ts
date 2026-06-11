import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const query = `
      SELECT alert_id, alert_type, severity, title, description, created_at, status
      FROM \`onelinkto.public.alerts\`
      ORDER BY created_at DESC
    `;

    const [rows] = await bigquery.query({ query });
    return NextResponse.json({ success: true, data: rows });
  } catch (error: any) {
    console.error("BigQuery Query Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch alerts from BigQuery" },
      { status: 500 }
    );
  }
}
