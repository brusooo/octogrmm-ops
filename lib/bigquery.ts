import { BigQuery } from "@google-cloud/bigquery";
import path from "path";

// Resolve key filename relative to process CWD, ignoring it for Turbopack bundle tracing
const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? path.resolve(/*turbopackIgnore: true*/ process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS)
  : undefined;

export const bigquery = new BigQuery({
  keyFilename,
  projectId: "onelinkto",
});
