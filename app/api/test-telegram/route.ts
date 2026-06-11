import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const message = "✅ Octogram Telegram notifications are working.";
    const success = await sendTelegramMessage(message);

    if (success) {
      return NextResponse.json({ success: true, message: "Test message sent successfully." });
    } else {
      return NextResponse.json(
        { success: false, error: "Failed to send Telegram message. Check environment variables and logs." },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error("Test Telegram route failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process test Telegram message";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
