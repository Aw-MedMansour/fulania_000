// FulanIA — AI translation grounded on dictionary (RAG)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es FulanIA-Lexique, un lexicographe expert du Pulaar/Fulfulde (Fouta Toro, Fouta Djallon, Macina).
Pour CHAQUE mot soumis, tu retournes UNE fiche multilingue précise et vérifiée.

Règles strictes :
- Orthographe Pulaar correcte avec ɓ ɗ ƴ ŋ.
- Si une « SOURCE DICTIONNAIRE » t'est fournie, ses entrées font autorité : recopie l'orthographe et la traduction exactes.
- Si tu n'es pas sûr d'une traduction, mets-la à null plutôt que d'inventer.
- L'exemple Pulaar doit être une phrase courte naturelle, accompagnée de sa traduction française.
- 'notes' : 1-2 phrases (dialecte, registre, étymologie, faux-amis). null si rien d'utile.
- Toujours appeler la fonction 'translation_card'. JAMAIS de texte libre.`;

const TOOL = {
  type: "function",
  function: {
    name: "translation_card",
    description: "Fiche de traduction multilingue Pulaar/FR/EN/AR.",
    parameters: {
      type: "object",
      properties: {
        pulaar: { type: "string", description: "Forme canonique en Pulaar (ɓ ɗ ƴ ŋ corrects)" },
        pronunciation: { type: ["string", "null"], description: "Prononciation simple, ex: 'no ngo-naa'" },
        french: { type: "string" },
        english: { type: ["string", "null"] },
        arabic: { type: ["string", "null"] },
        category: { type: ["string", "null"], description: "salutation, famille, verbe, nombre, nourriture, etc." },
        example_pulaar: { type: ["string", "null"] },
        example_french: { type: ["string", "null"] },
        notes: { type: ["string", "null"], description: "Précisions courtes (dialecte, registre)." },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
      },
      required: ["pulaar", "french", "confidence"],
      additionalProperties: false,
    },
  },
} as const;

async function fetchContext(supabase: ReturnType<typeof createClient>, q: string) {
  const safe = q.toLowerCase().replace(/[,()%_]/g, "").slice(0, 60);
  if (!safe) return [];
  const { data } = await supabase
    .from("dictionary_entries")
    .select("pulaar,french,english,arabic,pronunciation,example_pulaar,example_french,category")
    .or(`pulaar.ilike.%${safe}%,french.ilike.%${safe}%,english.ilike.%${safe}%,arabic.ilike.%${safe}%`)
    .limit(8);
  return data ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);




    const body = await req.json();
    const word = String(body?.word ?? "").trim().slice(0, 80);
    const sourceLang = ["auto", "ff", "fr", "en", "ar"].includes(body?.sourceLang) ? body.sourceLang : "auto";
    const langRaw = typeof body?.lang === "string" ? body.lang : "fr";
    const lang = ["fr", "ff", "en", "ar"].includes(langRaw) ? langRaw : "fr";
    const UI_LANG_LABEL: Record<string, string> = {
      fr: "français",
      ff: "Pulaar (Fulfulde)",
      en: "English",
      ar: "العربية (arabe)",
    };
    const dialectRaw = typeof body?.dialect === "string" ? body.dialect : "fouta_toro";
    const DIALECT_LABELS: Record<string, string> = {
      fouta_toro: "Pulaar du Fuuta Tooro (Sénégal, Mauritanie, Mali)",
      fouta_djallon: "Pular du Fuuta Jaloo (Guinée)",
      maasina: "Fulfulde du Maasina (Mali, Burkina, Niger)",
      aadamaawa: "Fulfulde de l'Aadamaawa (Nigeria, Cameroun, Tchad)",
    };
    const dialectLabel = DIALECT_LABELS[dialectRaw] ?? DIALECT_LABELS.fouta_toro;
    if (!word) {
      return new Response(JSON.stringify({ error: "Mot requis." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ctx = await fetchContext(supabase, word);
    const ctxBlock = ctx.length
      ? `\n\n=== SOURCE DICTIONNAIRE (autorité) ===\n${ctx
          .map((e: any) => `• ${e.pulaar}${e.pronunciation ? ` /${e.pronunciation}/` : ""} — FR: ${e.french}${e.english ? ` | EN: ${e.english}` : ""}${e.arabic ? ` | AR: ${e.arabic}` : ""}${e.example_pulaar ? `\n   ex: « ${e.example_pulaar} »${e.example_french ? ` (${e.example_french})` : ""}` : ""}`)
          .join("\n")}\n=== Fin source ===`
      : "";

    const localizationNote = `\n\nLANGUE D'INTERFACE DE L'UTILISATEUR : ${UI_LANG_LABEL[lang]}.\n- Les champs 'pulaar' et 'example_pulaar' restent OBLIGATOIREMENT en Pulaar (ne traduis pas).\n- Les champs 'french', 'english', 'arabic' gardent leur langue propre.\n- TOUS les autres champs rédactionnels destinés à l'utilisateur ('notes', 'category') DOIVENT être rédigés en ${UI_LANG_LABEL[lang]} avec une traduction de qualité (idiomatique, précise).\n- Malgré son nom, 'example_french' doit contenir la traduction de l'exemple dans la langue de l'utilisateur (${UI_LANG_LABEL[lang]}).`;

    const userMsg = `Mot à traduire : « ${word} »\nLangue source supposée : ${sourceLang}\nDIALECTE CIBLE : ${dialectLabel} — donne la forme principale dans ce dialecte ; mentionne brièvement dans 'notes' si la forme diffère ailleurs.${ctxBlock}${localizationNote}\n\nProduis la fiche en appelant translation_card.`;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Service indisponible." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "translation_card" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Limite atteinte." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      console.error("AI gateway:", resp.status, await resp.text());
      return new Response(JSON.stringify({ error: "Erreur IA." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const j = await resp.json();
    const call = j?.choices?.[0]?.message?.tool_calls?.[0];
    const args = call?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ error: "Réponse IA invalide." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const card = typeof args === "string" ? JSON.parse(args) : args;
    return new Response(JSON.stringify({ card, sources: ctx }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("translate err:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
