import { bigquery } from "./bigquery";

export async function generateAlerts(): Promise<void> {
  // Check if table exists, if not, create it first so MERGE doesn't fail
  const checkQuery = `
    CREATE TABLE IF NOT EXISTS \`onelinkto.public.alerts\` (
      alert_id STRING,
      alert_type STRING,
      severity STRING,
      title STRING,
      description STRING,
      created_at TIMESTAMP,
      status STRING,
      updated_at TIMESTAMP
    )
  `;
  await bigquery.query({ query: checkQuery });

  // Ensure updated_at column exists in case table was created previously without it
  try {
    await bigquery.query({
      query: `ALTER TABLE \`onelinkto.public.alerts\` ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP`
    });
  } catch (alterErr) {
    console.warn("Could not alter table to add updated_at column:", alterErr);
  }

  // Execute MERGE query using deterministic alert IDs
  const mergeQuery = `
    MERGE \`onelinkto.public.alerts\` T
    USING (
      WITH daily_sales AS (
        SELECT 
          medicine_id,
          COALESCE(SUM(quantity_sold) / NULLIF(DATE_DIFF(MAX(sale_date), MIN(sale_date), DAY) + 1, 0), 1.0) AS avg_daily_sales
        FROM \`onelinkto.public.medicine_sales\`
        GROUP BY medicine_id
      ),
      medicine_status AS (
        SELECT
          i.medicine_id,
          i.medicine_name,
          i.current_stock,
          i.reorder_level,
          COALESCE(s.avg_daily_sales, 1.0) AS avg_daily_sales,
          SAFE_DIVIDE(i.current_stock, COALESCE(s.avg_daily_sales, 1.0)) AS days_remaining
        FROM \`onelinkto.public.medicine_inventory\` i
        LEFT JOIN daily_sales s ON i.medicine_id = s.medicine_id
      ),
      predicted_alerts AS (
        SELECT
          CONCAT('medicine_stockout_', CAST(medicine_id AS STRING)) AS alert_id,
          'Supply Chain' AS alert_type,
          CASE 
            WHEN days_remaining <= 1.0 THEN 'Critical'
            ELSE 'High'
          END AS severity,
          CONCAT('Critical Stockout Prediction: ', medicine_name) AS title,
          CONCAT(medicine_name, ' inventory is critically low (', current_stock, ' units remaining). At current average daily usage of ', ROUND(avg_daily_sales, 1), ' units, stock is projected to run out in ', ROUND(days_remaining, 1), ' days.') AS description,
          CURRENT_TIMESTAMP() AS created_at,
          'Open' AS status
        FROM medicine_status
        WHERE days_remaining <= 3.0 -- Alert if runs out in 3 days or less
      ),
      static_alerts AS (
        SELECT 'alt-staff-001' AS alert_id, 'Staffing' AS alert_type, 'High' AS severity, 'Dr. Kumar Schedule Overload' AS title, 'Dr Kumar is overloaded tomorrow (14.5 hrs)' AS description, CURRENT_TIMESTAMP() AS created_at, 'Open' AS status
        UNION ALL
        SELECT 'alt-ops-001', 'Operations', 'Medium', 'STAT Lab Processing Delays', '12 lab tests are delayed beyond SLA', CURRENT_TIMESTAMP(), 'Open'
        UNION ALL
        SELECT 'alt-fin-001', 'Financial', 'Medium', 'Cardiology Revenue Drop', 'Cardiology revenue dropped 15% vs 30d avg', CURRENT_TIMESTAMP(), 'Open'
      )
      SELECT * FROM predicted_alerts
      UNION ALL
      SELECT * FROM static_alerts
    ) S
    ON T.alert_id = S.alert_id
    WHEN MATCHED AND T.status = 'Open' THEN
      UPDATE SET title = S.title, description = S.description, severity = S.severity, alert_type = S.alert_type, created_at = S.created_at, updated_at = S.created_at
    WHEN NOT MATCHED THEN
      INSERT (alert_id, alert_type, severity, title, description, created_at, status, updated_at)
      VALUES (S.alert_id, S.alert_type, S.severity, S.title, S.description, S.created_at, S.status, S.created_at)
  `;

  await bigquery.query({ query: mergeQuery });
}

export interface BigQueryAlert {
  alert_id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string;
  created_at: unknown;
  status: string;
  updated_at?: unknown;
}

export async function getOpenAlerts(): Promise<BigQueryAlert[]> {
  const query = `
    SELECT alert_id, alert_type, severity, title, description, created_at, status
    FROM \`onelinkto.public.alerts\`
    WHERE status = 'Open'
    ORDER BY created_at DESC
  `;
  const [rows] = await bigquery.query({ query });
  return rows as BigQueryAlert[];
}

export async function getCriticalAlerts(): Promise<BigQueryAlert[]> {
  const query = `
    SELECT alert_id, alert_type, severity, title, description, created_at, status
    FROM \`onelinkto.public.alerts\`
    WHERE severity = 'Critical' AND status = 'Open'
    ORDER BY created_at DESC
  `;
  const [rows] = await bigquery.query({ query });
  return rows as BigQueryAlert[];
}

export async function getHighAlerts(): Promise<BigQueryAlert[]> {
  const query = `
    SELECT alert_id, alert_type, severity, title, description, created_at, status
    FROM \`onelinkto.public.alerts\`
    WHERE severity = 'High' AND status = 'Open'
    ORDER BY created_at DESC
  `;
  const [rows] = await bigquery.query({ query });
  return rows as BigQueryAlert[];
}
