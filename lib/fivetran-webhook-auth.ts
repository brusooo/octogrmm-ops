import crypto from "crypto";

export function verifyFivetranSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.FIVETRAN_WEBHOOK_SECRET;

  if (process.env.NODE_ENV === "development" && !secret) {
    console.log("Fivetran signature verification skipped in development because secret is missing.");
    return true;
  }

  if (!secret) {
    console.warn("Fivetran signature verification failed: FIVETRAN_WEBHOOK_SECRET is not configured.");
    return false;
  }

  if (!signature) {
    console.warn("Fivetran signature verification failed: Missing x-fivetran-signature-256 header.");
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    const signatureBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    if (signatureBuffer.length !== expectedBuffer.length) {
      console.warn("Fivetran signature verification failed: Signature length mismatch.");
      return false;
    }

    const isValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    if (!isValid) {
      console.warn("Fivetran signature verification failed: Invalid signature.");
      return false;
    }

    console.log("Fivetran webhook signature verified");
    return true;
  } catch (error: unknown) {
    console.error("Error verifying Fivetran signature:", error);
    return false;
  }
}
