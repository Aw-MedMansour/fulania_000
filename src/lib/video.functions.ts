import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MODEL = "google/veo-3.1"; // meilleur modèle vidéo disponible
const BUCKET = "generated-videos";
const GATEWAY = "https://ai.gateway.lovable.dev/v1";

export type VideoItem = {
  id: string;
  description: string;
  prompt: string;
  status: string;
  aspect_ratio: string;
  duration_seconds: number;
  resolution: string;
  error_message: string | null;
  created_at: string;
  url: string | null;
};

function aiHeaders() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("LOVABLE_API_KEY manquante");
  return { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function signed(db: Awaited<ReturnType<typeof admin>>, path: string | null) {
  if (!path) return null;
  const { data } = await db.storage.from(BUCKET).createSignedUrl(path, 3600);
  return data?.signedUrl ?? null;
}

/* ---------- Solde de crédits ---------- */

export const getVideoCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const { data } = await db
      .from("video_credits")
      .select("balance, total_used")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (data) return { balance: data.balance, totalUsed: data.total_used };
    await db.from("video_credits").insert({ user_id: context.userId });
    return { balance: 1, totalUsed: 0 };
  });

/* ---------- Amélioration du prompt ---------- */

export const refineVideoPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { description: string }) =>
    z.object({ description: z.string().min(3).max(1200) }).parse(d),
  )
  .handler(async ({ data }) => {
    const res = await fetch(`${GATEWAY}/chat/completions`, {
      method: "POST",
      headers: aiHeaders(),
      body: JSON.stringify({
        model: "openai/gpt-5.6-sol",
        messages: [
          {
            role: "system",
            content:
              "You turn a short description (in Pulaar, French, English or Arabic) into ONE cinematic English video prompt for a text-to-video model. One single scene only. Describe subject, action, setting, camera movement, lighting, mood, and the soundtrack/ambience. Honour Fulɓe (Pulaar/Fulani) visual culture accurately and respectfully when relevant: Sahel landscapes, cattle herding, indigo and gold textiles, calabashes, braided hairstyles, flute and hoddu music. If a spoken line is wanted, write it as `The man says: ...` without quotation marks. Reply with the prompt only, no preamble, max 90 words.",
          },
          { role: "user", content: data.description },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Trop de requêtes, réessaie dans un instant.");
      if (res.status === 402) throw new Error("Crédits IA épuisés pour cet espace de travail.");
      throw new Error(`Erreur IA ${res.status}: ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const prompt = json.choices?.[0]?.message?.content?.trim();
    if (!prompt) throw new Error("Prompt vide renvoyé par l'IA.");
    return { prompt };
  });

/* ---------- Lancer une génération ---------- */

export const startVideoGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        description: z.string().min(3).max(1200),
        prompt: z.string().min(3).max(2000),
        aspectRatio: z.enum(["16:9", "9:16"]).default("16:9"),
        durationSeconds: z.union([z.literal(4), z.literal(6), z.literal(8)]).default(8),
        resolution: z.enum(["720p", "1080p"]).default("720p"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const db = await admin();
    const userId = context.userId;

    // Un seul job à la fois
    const { count: running } = await db
      .from("video_generations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["pending", "in_progress"]);
    if ((running ?? 0) > 0) throw new Error("Une vidéo est déjà en cours de génération.");

    // Crédit
    const { data: credits } = await db
      .from("video_credits")
      .select("balance, total_used")
      .eq("user_id", userId)
      .maybeSingle();
    const balance = credits?.balance ?? (await db.from("video_credits").insert({ user_id: userId }), 1);
    if (balance < 1) throw new Error("Solde de crédits vidéo insuffisant.");

    await db
      .from("video_credits")
      .update({ balance: balance - 1, total_used: (credits?.total_used ?? 0) + 1 })
      .eq("user_id", userId);

    const res = await fetch(`${GATEWAY}/videos`, {
      method: "POST",
      headers: aiHeaders(),
      body: JSON.stringify({
        model: MODEL,
        instances: [{ prompt: data.prompt }],
        parameters: {
          durationSeconds: data.resolution === "1080p" ? 8 : data.durationSeconds,
          resolution: data.resolution,
          aspectRatio: data.aspectRatio,
          sampleCount: 1,
          generateAudio: true,
        },
      }),
    });

    if (!res.ok) {
      // remboursement
      await db.from("video_credits").update({ balance, total_used: credits?.total_used ?? 0 }).eq("user_id", userId);
      const body = await res.text().catch(() => "");
      if (res.status === 429) throw new Error("Le service vidéo est saturé, réessaie dans quelques minutes.");
      if (res.status === 402) throw new Error("Crédits IA épuisés pour cet espace de travail.");
      throw new Error(`Génération refusée (${res.status}): ${body.slice(0, 250)}`);
    }

    const job = (await res.json()) as { id: string };
    const { data: row, error } = await db
      .from("video_generations")
      .insert({
        user_id: userId,
        job_id: job.id,
        model: MODEL,
        description: data.description,
        prompt: data.prompt,
        aspect_ratio: data.aspectRatio,
        duration_seconds: data.resolution === "1080p" ? 8 : data.durationSeconds,
        resolution: data.resolution,
        status: "in_progress",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id, balance: balance - 1 };
  });

/* ---------- Suivi du job ---------- */

export const pollVideoGeneration = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }): Promise<{ status: string; url: string | null; error: string | null }> => {
    const db = await admin();
    const { data: row } = await db
      .from("video_generations")
      .select("*")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!row) throw new Error("Vidéo introuvable.");
    if (row.status === "completed") {
      return { status: "completed", url: await signed(db, row.storage_path), error: null };
    }
    if (row.status === "failed") return { status: "failed", url: null, error: row.error_message };

    const res = await fetch(`${GATEWAY}/videos/${row.job_id}`, { headers: aiHeaders() });
    if (!res.ok) return { status: "in_progress", url: null, error: null };
    const job = (await res.json()) as { status: string; error?: { message?: string } };

    if (job.status === "failed") {
      await db
        .from("video_generations")
        .update({ status: "failed", error_message: job.error?.message ?? "Génération échouée." })
        .eq("id", row.id);
      const { data: c } = await db
        .from("video_credits")
        .select("balance, total_used")
        .eq("user_id", context.userId)
        .maybeSingle();
      if (c) {
        await db
          .from("video_credits")
          .update({ balance: c.balance + row.credits_spent, total_used: Math.max(0, c.total_used - row.credits_spent) })
          .eq("user_id", context.userId);
      }
      return { status: "failed", url: null, error: job.error?.message ?? "Génération échouée." };
    }

    if (job.status !== "completed") return { status: "in_progress", url: null, error: null };

    const content = await fetch(`${GATEWAY}/videos/${row.job_id}/content`, { headers: aiHeaders() });
    if (!content.ok) return { status: "in_progress", url: null, error: null };
    const bytes = new Uint8Array(await content.arrayBuffer());
    const path = `${context.userId}/${row.id}.mp4`;
    const { error: upErr } = await db.storage
      .from(BUCKET)
      .upload(path, bytes, { contentType: "video/mp4", upsert: true });
    if (upErr) throw new Error(upErr.message);

    await db.from("video_generations").update({ status: "completed", storage_path: path }).eq("id", row.id);
    return { status: "completed", url: await signed(db, path), error: null };
  });

/* ---------- Galerie ---------- */

export const listMyVideos = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<VideoItem[]> => {
    const db = await admin();
    const { data } = await db
      .from("video_generations")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(30);
    const rows = data ?? [];
    return Promise.all(
      rows.map(async (r) => ({
        id: r.id,
        description: r.description,
        prompt: r.prompt,
        status: r.status,
        aspect_ratio: r.aspect_ratio,
        duration_seconds: r.duration_seconds,
        resolution: r.resolution,
        error_message: r.error_message,
        created_at: r.created_at,
        url: r.status === "completed" ? await signed(db, r.storage_path) : null,
      })),
    );
  });

export const deleteMyVideo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: row } = await db
      .from("video_generations")
      .select("storage_path")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (row?.storage_path) await db.storage.from(BUCKET).remove([row.storage_path]);
    await db.from("video_generations").delete().eq("id", data.id).eq("user_id", context.userId);
    return { ok: true };
  });

/* ---------- Admin : créditer un compte ---------- */

export const grantVideoCredits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ email: z.string().email(), amount: z.number().int().min(1).max(500) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const db = await admin();
    const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const user = list?.users.find((u) => u.email?.toLowerCase() === data.email.toLowerCase());
    if (!user) throw new Error("Utilisateur introuvable.");
    const { data: c } = await db
      .from("video_credits")
      .select("balance, total_purchased")
      .eq("user_id", user.id)
      .maybeSingle();
    if (c) {
      await db
        .from("video_credits")
        .update({ balance: c.balance + data.amount, total_purchased: c.total_purchased + data.amount })
        .eq("user_id", user.id);
    } else {
      await db
        .from("video_credits")
        .insert({ user_id: user.id, balance: 1 + data.amount, total_purchased: data.amount });
    }
    return { ok: true };
  });
