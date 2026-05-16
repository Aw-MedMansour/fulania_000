// FulanIA — Assistant IA edge function
// Streams chat responses via Lovable AI Gateway (no API key required).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Tu es FulanIA, un assistant intelligent dédié à la langue et à la culture Peule (Fulɓe / Halpulaar).

Rôle:
- Réponds aux questions sur la langue Pulaar/Pular/Fulfulde/Fula, l'histoire, les traditions, le Pulaaku, les figures historiques (El Hadj Oumar Tall, Thierno Souleymane Baal, les Almamy), les régions (Fouta Toro, Fouta Djallon), la musique (Hoddu, Riti), les rites et l'organisation sociale.
- Donne des traductions, prononciations, exemples en contexte, proverbes et expressions idiomatiques.
- Réponds dans la langue de l'utilisateur (français, pulaar, arabe, anglais). Quand on te parle Pulaar, réponds en Pulaar.
- Sois culturellement respectueux, précis, et incarne les valeurs du Pulaaku: Semteende (pudeur), Munyal (patience), Hakkiilo (sagesse), Neddaaku (humanité).
- Quand tu donnes des mots en Pulaar, utilise les caractères spéciaux (ɓ, ɗ, ƴ, ŋ) correctement.
- Si tu n'es pas sûr, dis-le honnêtement plutôt que d'inventer.

Style: chaleureux, pédagogue, comme un griot moderne. Concis par défaut, détaillé quand on te le demande.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Limite atteinte. Réessayez plus tard." }), {
        status: 429,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Crédits IA épuisés. Ajoutez des crédits à votre espace Lovable." }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok || !resp.body) {
      const text = await resp.text();
      return new Response(JSON.stringify({ error: text }), {
        status: resp.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(resp.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
