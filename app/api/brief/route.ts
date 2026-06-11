import { NextResponse } from "next/server";
import { bigquery } from "@/lib/bigquery";
import { askOllama } from "@/lib/ollama";

export const dynamic = "force-dynamic";

// Helper function to query local Ollama and generate operations brief
async function generateOperationsBrief(alerts: any[]): Promise<any> {
  const prompt = `You are a Hospital Operations AI.

Analyze these hospital alerts and return ONLY valid JSON.

Return exactly:

{
  "summary": "string",
  "top_risks": [
    "string"
  ],
  "recommended_actions": [
    "string"
  ]
}

Alerts:
${JSON.stringify(alerts, null, 2)}`;

  const fallback = {
    summary: "Hospital operations detected active inventory risks requiring review.",
    top_risks: [
      "Medicine inventory shortages"
    ],
    recommended_actions: [
      "Review inventory",
      "Contact suppliers",
      "Monitor stock levels"
    ]
  };

  try {
    // Call the shared Ollama helper
    const text = await askOllama(prompt);

    // Output detailed console logging
    console.log("Ollama response:", text);

    return parseOllamaJson(text, fallback);
  } catch (error) {
    console.error("Error generating operations brief with Ollama:", error);
    return fallback;
  }
}

// Extract and parse JSON safely
function parseOllamaJson(text: string, fallback: any): any {
  const cleaned = text.trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Attempt markdown json block extraction
    const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (innerErr) {
        // Fall through
      }
    }

    // Attempt index bracket extraction
    const startIdx = cleaned.indexOf("{");
    const endIdx = cleaned.lastIndexOf("}");
    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      try {
        return JSON.parse(cleaned.substring(startIdx, endIdx + 1));
      } catch (innerErr) {
        // Fall through
      }
    }

    console.warn("JSON parsing failed on Ollama response. Using fallback brief.");
    return fallback;
  }
}

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({
      summary: "AI operations brief is disabled in production. Ollama and Gemma are used in the local environment.",
      recommended_actions: []
    });
  }

  try {
    // 1. Fetch active alerts from BigQuery
    const query = `
      SELECT alert_id, alert_type, severity, title, description, created_at, status
      FROM \`onelinkto.public.alerts\`
      ORDER BY created_at DESC
    `;
    const [alerts] = await bigquery.query({ query });

    if (!alerts || alerts.length === 0) {
      return NextResponse.json({
        summary: "No active operational alerts found in the database. All hospital operations systems are currently functioning within normal ranges.",
        recommended_actions: []
      });
    }

    // 2. Generate structured report using Ollama
    const brief = await generateOperationsBrief(alerts);

    // 3. Map string recommendations to the object format expected by the frontend
    const mappedActions = (brief.recommended_actions || []).map((actionText: string, index: number) => {
      const matchingAlert = alerts[index % alerts.length] || null;
      const id = matchingAlert ? matchingAlert.alert_id : `fallback-${index}`;
      const type = matchingAlert ? matchingAlert.alert_type : "Operations";
      
      let title = actionText;
      let description = actionText;

      if (actionText.includes(":")) {
        const parts = actionText.split(":");
        title = parts[0].trim();
        description = parts.slice(1).join(":").trim();
      } else if (actionText.length > 40) {
        title = actionText.substring(0, 40) + "...";
      }

      return {
        id,
        type,
        title,
        description
      };
    });

    return NextResponse.json({
      summary: brief.summary,
      recommended_actions: mappedActions
    });
  } catch (error: any) {
    console.error("API Brief Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate AI morning brief" },
      { status: 500 }
    );
  }
}
