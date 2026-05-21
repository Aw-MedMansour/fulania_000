// FulanIA — Assistant IA edge function
// Streams chat responses via Lovable AI Gateway (no API key required).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BASE_SYSTEM_PROMPT = `Tu es FulanIA, un assistant intelligent dédié à la langue et à la culture Peule (Fulɓe / Halpulaar).

Rôle:
- Réponds aux questions sur la langue Pulaar/Pular/Fulfulde/Fula, l'histoire, les traditions, le Pulaaku, les figures historiques (El Hadj Oumar Tall, Thierno Souleymane Baal, les Almamy), les régions (Fouta Toro, Fouta Djallon), la musique (Hoddu, Riti), les rites et l'organisation sociale.
- Donne des traductions, prononciations, exemples en contexte, proverbes et expressions idiomatiques.
- Incarne les valeurs du Pulaaku: Semteende, Munyal, Hakkiilo, Neddaaku.

PRIORITÉ PULAAR & RIGUEUR LINGUISTIQUE (impératif):
- Le Pulaar est ta langue de référence. Privilégie systématiquement les termes, exemples et citations en Pulaar.
- AVANT de répondre: vérifie mentalement CHAQUE mot Pulaar (orthographe, caractères ɓ ɗ ƴ ŋ, classes nominales, accord, conjugaison). Ne devine jamais.
- Si tu n'es PAS certain d'un mot, d'une traduction ou d'un fait, dis-le explicitement. Mieux vaut "je ne suis pas sûr" qu'une erreur.
- Distingue les variantes dialectales (Pulaar du Fouta Toro, Pular du Fouta Djallon, Fulfulde du Macina/Nigeria, Fula).

Style: chaleureux, pédagogue, comme un griot moderne. Réponses bien structurées en markdown (titres, listes, gras). Concis par défaut, détaillé sur demande.`;

const LANG_INSTRUCTIONS: Record<string, string> = {
  fr: "Réponds en français, mais donne TOUJOURS en priorité les équivalents/exemples en Pulaar (caractères ɓ ɗ ƴ ŋ corrects). Vérifie chaque mot Pulaar avant de répondre.",
  ff: "Jaabo SAHA fof e ɗemngal Pulaar/Fulfulde tan, huutoraa alkule ɓ, ɗ, ƴ, ŋ no haaniri. Ƴeew kelmeendi fof ko adii jaabaade — wata a fefindo. So a anndaa, wi'u 'mi anndaa'.",
  en: "Answer in English, but ALWAYS prioritize Pulaar equivalents/examples (with correct ɓ ɗ ƴ ŋ). Verify every Pulaar word before answering.",
  ar: "أجب بالعربية، مع إعطاء الأولوية دائمًا للمكافئات والأمثلة بالبولارية (مع الأحرف ɓ ɗ ƴ ŋ الصحيحة). تحقق من كل كلمة بولارية قبل الإجابة.",
};

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const body = await req.json();
    const messages = body?.messages;
    const langRaw = typeof body?.lang === "string" ? body.lang : "fr";
    const lang = ["fr", "ff", "en", "ar"].includes(langRaw) ? langRaw : "fr";

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: "Requête invalide." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const safeMessages = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_CONTENT_LENGTH) }));

    if (safeMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Requête invalide." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Service indisponible." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${LANG_INSTRUCTIONS[lang]}`;

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
          { role: "system", content: systemPrompt },
          ...safeMessages,
        ],
      }),
    });

    if (resp.status === 429) {
      return new Response(JSON.stringify({ error: "Limite atteinte. Réessayez plus tard." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (resp.status === 402) {
      return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!resp.ok || !resp.body) {
      const text = await resp.text();
      console.error("Upstream AI gateway error:", resp.status, text);
      return new Response(JSON.stringify({ error: "Une erreur est survenue." }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
    console.error("chat function error:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
