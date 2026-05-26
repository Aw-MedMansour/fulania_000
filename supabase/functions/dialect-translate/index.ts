// FulanIA — Multi-dialect Pulaar translator


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es FulanIA-Dialectes, expert des grandes variantes du Pulaar / Fulfulde.
Pour un mot ou phrase donné, tu produis sa forme dans CHACUN des quatre principaux dialectes :
- Pulaar du Fouta Toro (Sénégal, Mauritanie, Mali)
- Pular du Fouta Djallon (Guinée)
- Fulfulde du Macina (Mali, Burkina, Niger)
- Fulfulde de l'Adamawa (Nigeria, Cameroun, Tchad)

Règles strictes :
- Orthographe correcte avec ɓ ɗ ƴ ŋ.
- Si une variante est identique à une autre, recopie-la (ne mets PAS null).
- Si tu n'es VRAIMENT pas sûr d'une variante, mets-la à null plutôt que d'inventer.
- 'notes' : 1-2 phrases sur les différences notables. null sinon.
- Toujours appeler la fonction 'dialect_card'.`;

const TOOL = {
  type: "function",
  function: {
    name: "dialect_card",
    description: "Variantes dialectales d'un mot/phrase Pulaar.",
    parameters: {
      type: "object",
      properties: {
        source: { type: "string", description: "Forme source normalisée." },
        meaning_fr: { type: "string", description: "Sens en français." },
        fouta_toro: { type: ["string", "null"] },
        fouta_djallon: { type: ["string", "null"] },
        macina: { type: ["string", "null"] },
        adamawa: { type: ["string", "null"] },
        notes: { type: ["string", "null"] },
        confidence: { type: "string", enum: ["high", "medium", "low"] },
      },
      required: ["source", "meaning_fr", "confidence"],
      additionalProperties: false,
    },
  },
} as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    // JWT déjà vérifié par la gateway Supabase (verify_jwt = true)


    const body = await req.json();
    const text = String(body?.text ?? "").trim().slice(0, 200);
    const langRaw = typeof body?.lang === "string" ? body.lang : "fr";
    const lang = ["fr", "ff", "en", "ar"].includes(langRaw) ? langRaw : "fr";
    const UI_LANG_LABEL: Record<string, string> = {
      fr: "français",
      ff: "Pulaar (Fulfulde)",
      en: "English",
      ar: "العربية (arabe)",
    };
    if (!text) {
      return new Response(JSON.stringify({ error: "Texte requis." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Service indisponible." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const localizationNote = `\n\nLANGUE D'INTERFACE UTILISATEUR : ${UI_LANG_LABEL[lang]}.\n- Les champs dialectaux ('fouta_toro', 'fouta_djallon', 'macina', 'adamawa') restent en Pulaar/Fulfulde.\n- Malgré son nom, 'meaning_fr' doit contenir le sens dans la langue de l'utilisateur (${UI_LANG_LABEL[lang]}), traduction soignée et idiomatique.\n- 'notes' également en ${UI_LANG_LABEL[lang]}.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `Mot/phrase : « ${text} »${localizationNote}\n\nProduis la fiche dialectale en appelant dialect_card.` },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "dialect_card" } },
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Limite atteinte." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) {
      console.error("AI gateway:", resp.status, await resp.text());
      return new Response(JSON.stringify({ error: "Erreur IA." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const j = await resp.json();
    const args = j?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) {
      return new Response(JSON.stringify({ error: "Réponse IA invalide." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const card = typeof args === "string" ? JSON.parse(args) : args;
    return new Response(JSON.stringify({ card }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("dialect-translate err:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
