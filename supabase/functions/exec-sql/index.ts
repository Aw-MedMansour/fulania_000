// Internal admin SQL exec. Protected by EXEC_SQL_SECRET shared secret.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  const secret = Deno.env.get("EXEC_SQL_SECRET");
  const provided = req.headers.get("x-exec-secret");
  if (!secret || provided !== secret) {
    return new Response("forbidden", { status: 403 });
  }
  const sql = await req.text();
  if (!sql.trim()) return new Response("empty", { status: 400 });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  // Use pg meta via direct postgres? Simpler: rpc to a custom fn, but we don't have it.
  // Use PostgREST is not for DDL/DML across many statements. Use fetch to db via SQL endpoint.
  // Workaround: call the Supabase SQL exec via management API? Not available here.
  // Instead, split statements and use a transaction via the pg http endpoint.
  // We'll use the pgrest "pg" sql tag through a function — but none exists.
  // Simplest: spawn statements through supabase-js using rpc('exec_sql', { sql }) where exec_sql is created via migration.
  const { data, error } = await supa.rpc("exec_sql_admin", { _sql: sql });
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify({ ok: true, data }), { headers: { "content-type": "application/json" } });
});
