const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function toSnakeCaseRecord(record) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [
      key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`),
      value,
    ])
  );
}

async function sendSupabaseRecord(table, record, { method = "POST", query = "", prefer = "return=minimal" } = {}) {
  if (!isSupabaseConfigured()) {
    return { saved: false, skipped: true };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: JSON.stringify(toSnakeCaseRecord(record)),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Supabase insert failed (${table}): ${response.status} ${details}`);
  }

  return { saved: true };
}

export async function insertSupabaseRecord(table, record) {
  return sendSupabaseRecord(table, record);
}

export async function upsertSupabaseRecord(table, record, conflictKey) {
  const query = conflictKey ? `?on_conflict=${encodeURIComponent(conflictKey)}` : "";
  return sendSupabaseRecord(table, record, {
    method: "POST",
    query,
    prefer: "resolution=merge-duplicates,return=minimal",
  });
}

export async function updateSupabaseRecord(table, record, filterColumn, filterValue) {
  const query = `?${encodeURIComponent(filterColumn)}=eq.${encodeURIComponent(filterValue)}`;
  return sendSupabaseRecord(table, record, { method: "PATCH", query });
}
