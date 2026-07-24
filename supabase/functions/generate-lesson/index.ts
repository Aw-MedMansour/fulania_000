// FulanIA — AI-generated mini-lesson on any Pulaar topic, grounded on dictionary
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM = `Tu es FulanIA-Pédagogue. Tu crées des mini-leçons de Pulaar (Fouta Toro) précises et engageantes pour les apprenants.
Règles :
- Orthographe Pulaar correcte (ɓ ɗ ƴ ŋ).
- Si une SOURCE DICTIONNAIRE est fournie, ses entrées font autorité — reprends-les telles quelles.
- Si tu n'es pas certain d'un mot, ne l'inclus pas plutôt que d'inventer.
- Toujours appeler la fonction 'mini_lesson'. Pas de texte libre.`;

const TOOL = {
  type: "function",
  function: {
    name: "mini_lesson",
    description: "Mini-leçon structurée sur un thème Pulaar.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        intro: { type: "string", description: "2-3 phrases de contexte culturel." },
        vocabulary: {
          type: "array",
          maxItems: 8,
          items: {
            type: "object",
            properties: {
              pulaar: { type: "string" },
              french: { type: "string" },
              pronunciation: { type: ["string", "null"] },
            },
            required: ["pulaar", "french"],
            additionalProperties: false,
          },
        },
        dialogue: {
          type: "array",
          maxItems: 6,
          items: {
            type: "object",
            properties: {
              speaker: { type: "string" },
              pulaar: { type: "string" },
              french: { type: "string" },
            },
            required: ["speaker", "pulaar", "french"],
            additionalProperties: false,
          },
        },
        tips: { type: "array", items: { type: "string" }, maxItems: 4 },
      },
      required: ["title", "intro", "vocabulary"],
      additionalProperties: false,
    },
  },
} as const;

async function fetchContext(supabase: ReturnType<typeof createClient>, topic: string) {
  const safe = topic.toLowerCase().replace(/[,()%_]/g, "").slice(0, 60);
  const { data } = await supabase
    .from("dictionary_entries")
    .select("pulaar,french,pronunciation,category,example_pulaar,example_french")
    .or(`category.ilike.%${safe}%,french.ilike.%${safe}%,pulaar.ilike.%${safe}%`)
    .limit(15);
  return data ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);




    const body = await req.json();
    const topic = String(body?.topic ?? "").trim().slice(0, 120);
    const level = ["debutant", "intermediaire", "avance"].includes(body?.level) ? body.level : "debutant";
    const dialectRaw = typeof body?.dialect === "string" ? body.dialect : "fouta_toro";
    const langRaw = typeof body?.lang === "string" ? body.lang : "fr";
    const lang = ["fr", "ff", "en", "ar"].includes(langRaw) ? langRaw : "fr";
    const UI_LANG_LABEL: Record<string, string> = {
      fr: "français",
      ff: "Pulaar (Fulfulde)",
      en: "English",
      ar: "العربية (arabe)",
    };
    const DIALECT_LABELS: Record<string, string> = {
      fouta_toro: "Pulaar du Fuuta Tooro (Sénégal, Mauritanie, Mali)",
      fouta_djallon: "Pular du Fuuta Jaloo (Guinée)",
      maasina: "Fulfulde du Maasina (Mali, Burkina, Niger)",
      aadamaawa: "Fulfulde de l'Aadamaawa (Nigeria, Cameroun, Tchad)",
    };
    const dialectLabel = DIALECT_LABELS[dialectRaw] ?? DIALECT_LABELS.fouta_toro;
    if (!topic) return new Response(JSON.stringify({ error: "Thème requis." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const ctx = await fetchContext(supabase, topic);
    const ctxBlock = ctx.length
      ? `\n\n=== SOURCE DICTIONNAIRE ===\n${ctx.map((e: any) => `• ${e.pulaar} — ${e.french}${e.pronunciation ? ` /${e.pronunciation}/` : ""}`).join("\n")}\n=== Fin source ===`
      : "";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return new Response(JSON.stringify({ error: "Service indisponible." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const localizationNote = `\n\nLANGUE D'INTERFACE UTILISATEUR : ${UI_LANG_LABEL[lang]}.\n- Les champs 'pulaar' (vocabulaire et dialogue) restent OBLIGATOIREMENT en Pulaar/${dialectLabel}.\n- 'title', 'intro', 'tips', et TOUS les champs 'french' (vocabulaire & dialogue), ainsi que 'pronunciation' et 'speaker' DOIVENT être rédigés en ${UI_LANG_LABEL[lang]} — traduction soignée et idiomatique.\n- Malgré son nom, le champ 'french' contient la traduction dans la langue de l'utilisateur (${UI_LANG_LABEL[lang]}).`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: `Thème : « ${topic} »\nNiveau : ${level}\nDIALECTE CIBLE : ${dialectLabel} — rédige le vocabulaire et le dialogue dans ce dialecte.${ctxBlock}${localizationNote}\n\nGénère la mini-leçon via mini_lesson.` },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "mini_lesson" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Limite atteinte." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      console.error("AI:", resp.status, await resp.text());
      return new Response(JSON.stringify({ error: "Erreur IA." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const j = await resp.json();
    const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return new Response(JSON.stringify({ error: "Réponse IA invalide." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const lesson = typeof args === "string" ? JSON.parse(args) : args;
    return new Response(JSON.stringify({ lesson }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("lesson err:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
