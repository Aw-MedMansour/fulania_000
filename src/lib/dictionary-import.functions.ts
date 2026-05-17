import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const EntrySchema = z.object({
  pulaar: z.string().trim().min(1).max(200),
  french: z.string().trim().min(1).max(300),
  arabic: z.string().trim().max(300).optional().nullable(),
  english: z.string().trim().max(300).optional().nullable(),
  category: z.string().trim().max(100).optional().nullable(),
  pronunciation: z.string().trim().max(200).optional().nullable(),
  example_pulaar: z.string().trim().max(500).optional().nullable(),
  example_french: z.string().trim().max(500).optional().nullable(),
});

const InputSchema = z.object({
  entries: z.array(EntrySchema).min(1).max(2000),
});

export const importDictionaryEntries = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const rows = data.entries.map((e) => ({
      pulaar: e.pulaar,
      french: e.french,
      arabic: e.arabic || null,
      english: e.english || null,
      category: e.category || null,
      pronunciation: e.pronunciation || null,
      example_pulaar: e.example_pulaar || null,
      example_french: e.example_french || null,
    }));

    const BATCH = 200;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += BATCH) {
      const slice = rows.slice(i, i + BATCH);
      const { error, count } = await supabaseAdmin
        .from("dictionary_entries")
        .insert(slice, { count: "exact" });
      if (error) throw new Error(`Batch ${i / BATCH + 1}: ${error.message}`);
      inserted += count ?? slice.length;
    }
    return { inserted };
  });
