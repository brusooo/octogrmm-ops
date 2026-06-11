import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";
import { askOllama } from "@/lib/ollama";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({
      response: "Pipeline status and chat are disabled in production since Ollama is not connected. This feature is intended for local environment usage.",
      message: "Pipeline status and chat are disabled in production since Ollama is not connected. This feature is intended for local environment usage."
    });
  }

  try {
    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 1. Fetch active alerts from BigQuery for live context
    let alerts: any[] = [];
    try {
      const query = `
        SELECT alert_id, alert_type, severity, title, description, created_at, status
        FROM \`onelinkto.public.alerts\`
        ORDER BY created_at DESC
      `;
      const [rows] = await bigquery.query({ query });
      alerts = rows || [];
    } catch (dbErr) {
      console.error("Database query failed inside chat endpoint:", dbErr);
    }

    // 2. Format context and prompt for Octogram AI
    const prompt = `You are Octogram AI.

You help hospital administrators understand operational data.

Available context:
* alerts: ${JSON.stringify(alerts, null, 2)}
* medicine inventory: Insulin Glargine runs out in 0.7 days, Vancomycin 500mg runs out in 2.9 days.
* medicine sales: McKesson reorder and PO-88492 processing.
* appointments: Tomorrow scheduling for Dr. Kumar (Anjali Kumar) Cardiology rounds and clinic (14.5 overloaded consecutive hours).
* billing: Cardiology revenue week-to-date billing dropped 15% below 30-day moving average.
* lab tests: 12 STAT urgent metabolic panels and cultures delayed beyond 45-minute SLA.

Answer only using available data.

If the answer cannot be determined from available data, say:
"I cannot determine that from the current hospital dataset."

Return concise operational responses. Do not give any medical diagnosis or clinical treatment recommendations.

User Question: ${message}`;

    // 3. Query local Ollama via shared helper
    try {
      const responseText = await askOllama(prompt);
      return NextResponse.json({ response: responseText });
    } catch (ollamaErr) {
      console.error("Ollama execution failed in chat endpoint:", ollamaErr);
      return NextResponse.json({
        response: "Operations AI is temporarily unavailable.",
        message: "Operations AI is temporarily unavailable."
      });
    }
  } catch (error: any) {
    console.error("Chat endpoint general failure:", error);
    return NextResponse.json({
      response: "Operations AI is temporarily unavailable.",
      message: "Operations AI is temporarily unavailable."
    });
  }
}
