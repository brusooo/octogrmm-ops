import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ alertId: string }> }
) {
  try {
    const { alertId } = await params;
    const { status } = await request.json();

    if (!status || !["resolved", "dismissed"].includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid status value. Expected 'resolved' or 'dismissed'." },
        { status: 400 }
      );
    }

    // Capitalize status value for database consistency ('Resolved', 'Dismissed')
    const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const query = `
      UPDATE \`onelinkto.public.alerts\`
      SET status = @status
      WHERE alert_id = @alertId
    `;

    await bigquery.query({
      query,
      params: {
        status: formattedStatus,
        alertId: alertId
      }
    });

    return NextResponse.json({ success: true, alert_id: alertId, status: formattedStatus });
  } catch (error: any) {
    console.error(`Failed to update alert status for alertId:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to update alert status in BigQuery" },
      { status: 500 }
    );
  }
}
