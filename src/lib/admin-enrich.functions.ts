import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type EnrichResult = {
  scanned: number;
  updated: number;
  remaining: number;
  errors: string[];
};

// Server function: enrich missing Arabic/English translations using Lovable AI.
// Requires authenticated admin user (role check inside).
export const enrichDictionaryTranslations = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    const i = (input ?? {}) as { batchSize?: number; batches?: number };
    return {
      batchSize: Math.max(10, Math.min(60, Number(i.batchSize) || 40)),
      batches: Math.max(1, Math.min(15, Number(i.batches) || 5)),
    };
  })
  .handler(async ({ data, context }): Promise<EnrichResult> => {
    const { supabase, userId } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden: admin only");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const errors: string[] = [];
    let totalScanned = 0;
    let totalUpdated = 0;

    for (let b = 0; b < data.batches; b++) {
      const { data: rows, error: selErr } = await supabaseAdmin
        .from("dictionary_entries")
        .select("id, pulaar, french, arabic, english")
        .or("arabic.is.null,arabic.eq.,english.is.null,english.eq.")
        .order("created_at", { ascending: true })
        .limit(data.batchSize);

      if (selErr) {
        errors.push(`select: ${selErr.message}`);
        break;
      }
      if (!rows || rows.length === 0) break;
      totalScanned += rows.length;

      const items = rows.map((r) => ({ id: r.id, pulaar: r.pulaar, french: r.french }));
      const prompt =
        "Traducteur professionnel pulaar/français/arabe/anglais. Pour chaque mot, " +
        "donne la traduction ARABE (écriture arabe) et ANGLAISE concise (1-4 mots). " +
        'Réponds UNIQUEMENT JSON: {"results":[{"id":"...","arabic":"...","english":"..."}]}\n\n' +
        `Mots:\n${JSON.stringify(items)}`;

      let parsed: { results?: Array<{ id: string; arabic?: string; english?: string }> } = {};
      try {
        const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": apiKey,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
          }),
        });
        if (!resp.ok) {
          errors.push(`ai ${resp.status}`);
          break;
        }
        const json = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = json.choices?.[0]?.message?.content ?? "{}";
        parsed = JSON.parse(content);
      } catch (e) {
        errors.push(`ai parse: ${(e as Error).message}`);
        continue;
      }

      const results = parsed.results ?? [];
      for (const it of results) {
        if (!it.id) continue;
        const row = rows.find((r) => r.id === it.id);
        if (!row) continue;
        const patch: Record<string, string> = {};
        if (it.arabic && !row.arabic) patch.arabic = it.arabic;
        if (it.english && !row.english) patch.english = it.english;
        if (Object.keys(patch).length === 0) continue;
        const { error: upErr } = await supabaseAdmin
          .from("dictionary_entries")
          .update(patch)
          .eq("id", it.id);
        if (upErr) errors.push(`upd ${it.id}: ${upErr.message}`);
        else totalUpdated++;
      }
    }

    const { count: remaining } = await supabaseAdmin
      .from("dictionary_entries")
      .select("id", { count: "exact", head: true })
      .or("arabic.is.null,arabic.eq.,english.is.null,english.eq.");

    return {
      scanned: totalScanned,
      updated: totalUpdated,
      remaining: remaining ?? -1,
      errors: errors.slice(0, 10),
    };
  });
