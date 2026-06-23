// Admin SQL executor. Requires shared secret in x-exec-secret header.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  const expected = Deno.env.get("EXEC_SQL_SECRET");
  const got = req.headers.get("x-exec-secret");
  if (!expected || got !== expected) return new Response("forbidden", { status: 403 });
  const sql = await req.text();
  if (!sql.trim()) return new Response("empty", { status: 400 });

  const supa = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );
  const { data, error } = await supa.rpc("exec_sql_admin", { _sql: sql });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ ok: true, affected: data }), {
    headers: { "content-type": "application/json" },
  });
});
