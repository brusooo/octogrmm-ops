import { BigQuery } from "@google-cloud/bigquery";

// Parse private key correctly (handling newlines if they are escaped)
const privateKey = process.env.GCP_PRIVATE_KEY
  ? process.env.GCP_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

export const bigquery = new BigQuery({
  projectId: process.env.GCP_PROJECT_ID,
  credentials: {
    client_email: process.env.GCP_CLIENT_EMAIL,
    private_key: privateKey,
  },
});
