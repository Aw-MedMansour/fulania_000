import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const POS_VALUES = [
  "nom","verbe","adjectif","adverbe","pronom","interjection",
  "expression","proverbe","conjonction","preposition","determinant","numeral",
] as const;

const STATUS_VALUES = ["valide", "propose", "incertain"] as const;

export type DictEntry = {
  id: string;
  headword: string;
  pos: string;
  domain: string;
  french: string;
  english: string | null;
  arabic: string | null;
  pronunciation_ipa: string | null;
  variant_fouta_tooro: string | null;
  variant_maasina: string | null;
  variant_fouta_jallon: string | null;
  variant_adamaawa: string | null;
  example_pulaar: string | null;
  example_french: string | null;
  status: string;
  origin: string;
  sources: string[] | null;
  notes: string | null;
};

export type DuplicateCandidate = Pick<
  DictEntry,
  "id" | "headword" | "french" | "domain" | "status"
>;

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const listProposedEntries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        search: z.string().trim().max(80).optional().default(""),
        domain: z.string().trim().max(60).optional().default(""),
        limit: z.number().int().min(1).max(100).optional().default(50),
        offset: z.number().int().min(0).optional().default(0),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    let q = context.supabase
      .from("dictionary_v2")
      .select(
        "id,headword,pos,domain,french,english,arabic,pronunciation_ipa,variant_fouta_tooro,variant_maasina,variant_fouta_jallon,variant_adamaawa,example_pulaar,example_french,status,origin,sources,notes",
        { count: "exact" },
      )
      .eq("status", "propose")
      .order("headword", { ascending: true })
      .range(data.offset, data.offset + data.limit - 1);

    const safeSearch = data.search.replace(/[,()%_*\\."']/g, " ").trim();
    if (safeSearch) {
      q = q.or(
        `headword.ilike.%${safeSearch}%,french.ilike.%${safeSearch}%`,
      );
    }
    if (data.domain) q = q.eq("domain", data.domain);

    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return { items: (rows ?? []) as DictEntry[], total: count ?? 0 };
  });

export const listDomains = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("dictionary_v2")
      .select("domain")
      .eq("status", "propose");
    if (error) throw new Error(error.message);
    const counts = new Map<string, number>();
    for (const r of data ?? []) counts.set(r.domain, (counts.get(r.domain) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count);
  });

export const findDuplicates = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ entryId: z.string().uuid() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: cur, error: e1 } = await context.supabase
      .from("dictionary_v2")
      .select("id,headword,french")
      .eq("id", data.entryId)
      .maybeSingle();
    if (e1) throw new Error(e1.message);
    if (!cur) return [];
    const { data: dupes, error: e2 } = await context.supabase
      .from("dictionary_v2")
      .select("id,headword,french,domain,status")
      .neq("id", data.entryId)
      .ilike("headword", cur.headword)
      .limit(20);
    if (e2) throw new Error(e2.message);
    return (dupes ?? []) as DuplicateCandidate[];
  });

export const updateEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        headword: z.string().trim().min(1).max(80),
        pos: z.enum(POS_VALUES),
        domain: z.string().trim().min(1).max(60),
        french: z.string().trim().min(1).max(300),
        english: z.string().trim().max(300).nullable().optional(),
        arabic: z.string().trim().max(300).nullable().optional(),
        pronunciation_ipa: z.string().trim().max(120).nullable().optional(),
        variant_fouta_tooro: z.string().trim().max(120).nullable().optional(),
        variant_maasina: z.string().trim().max(120).nullable().optional(),
        variant_fouta_jallon: z.string().trim().max(120).nullable().optional(),
        variant_adamaawa: z.string().trim().max(120).nullable().optional(),
        example_pulaar: z.string().trim().max(500).nullable().optional(),
        example_french: z.string().trim().max(500).nullable().optional(),
        notes: z.string().trim().max(1000).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { id, ...patch } = data;
    const cleaned: Record<string, string | null> = {};
    for (const [k, v] of Object.entries(patch)) {
      cleaned[k] = v === "" || v === undefined ? null : (v as string);
    }
    const { error } = await context.supabase
      .from("dictionary_v2")
      .update(cleaned as never)
      .eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setEntryStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ id: z.string().uuid(), status: z.enum(STATUS_VALUES) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("dictionary_v2")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteEntry = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("dictionary_v2")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
