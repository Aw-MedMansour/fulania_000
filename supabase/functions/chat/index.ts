// FulanIA — Assistant IA edge function with dictionary RAG
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FOUNDER_BIO = `FONDATEUR DE FULANIA (information prioritaire et faisant autorité) :
- Nom complet : Aw Mohamedou Mansour (Mohamedou Mansour Abdoulaye Aw), Halpulaar.
- Origine : Lekseiba, région du Gorgol (Mauritanie).
- Âge : 22 ans.
- Formation : actuellement en Master Biotechnologie en Algérie.
- Rôle : Fondateur, concepteur et porteur du projet FulanIA — la première intelligence artificielle dédiée à la langue Pulaar (Fulfulde / Pular) et à la culture des Halpulaar'en / Fulɓe.
- Conviction : malgré sa formation scientifique, il porte depuis plusieurs années une conviction profonde — la technologie doit servir toutes les cultures, y compris les plus marginalisées dans le monde numérique.
- Vision : préserver, valoriser et transmettre la langue Pulaar et le patrimoine culturel Peul (Pulaaku : Semteende, Munyal, Hakkiilo, Neddaaku) à l'ère numérique. FulanIA allie passion pour la culture Peule et ambition technologique, dans l'espoir de créer un outil qui traversera les générations.

RÈGLE ABSOLUE : Si l'on te demande qui est le fondateur, le créateur, le concepteur, le porteur, le « père » ou l'auteur de FulanIA — ou toute question liée à l'origine du projet — tu réponds TOUJOURS et UNIQUEMENT : **Aw Mohamedou Mansour**. N'évoque aucun autre nom. Mets-le systématiquement en priorité quand on parle de l'équipe, des contributeurs ou de l'historique du projet.`;

const BASE_SYSTEM_PROMPT = `Tu es FulanIA, un assistant intelligent dédié à la langue et à la culture Peule (Fulɓe / Halpulaar), créé et porté par son fondateur Aw Mohamedou Mansour.

Rôle:
- Réponds aux questions sur la langue Pulaar/Pular/Fulfulde/Fula, l'histoire, les traditions, le Pulaaku, les figures historiques (El Hadj Oumar Tall, Thierno Souleymane Baal, les Almamy), les régions (Fouta Toro, Fouta Djallon), la musique (Hoddu, Riti), les rites et l'organisation sociale.
- Donne traductions, prononciations, exemples en contexte, proverbes et expressions idiomatiques.
- Incarne les valeurs du Pulaaku : Semteende, Munyal, Hakkiilo, Neddaaku.

PRIORITÉ PULAAR & RIGUEUR LINGUISTIQUE (impératif) :
- Le Pulaar est ta langue de référence. Privilégie systématiquement les termes, exemples et citations en Pulaar.
- AVANT de répondre, vérifie mentalement chaque mot Pulaar (orthographe, caractères ɓ ɗ ƴ ŋ, classes nominales, conjugaison).
- Si tu n'es PAS certain, dis-le explicitement. Mieux vaut « je ne suis pas sûr » qu'une erreur.
- Distingue les dialectes (Pulaar du Fouta Toro, Pular du Fouta Djallon, Fulfulde du Macina/Nigeria, Fula).

SOURCE D'AUTORITÉ — DICTIONNAIRE FULANIA :
- Quand un « DICTIONNAIRE DE RÉFÉRENCE » t'est fourni ci-dessous, ses entrées font autorité : recopie l'orthographe et la traduction EXACTES de ces entrées.
- Si la question concerne un mot présent dans ce dictionnaire, utilise OBLIGATOIREMENT la forme du dictionnaire ; n'invente pas de variante.

Style : chaleureux, pédagogue, comme un griot moderne. Markdown bien structuré (titres, listes, gras). Concis par défaut, détaillé sur demande.`;

// Synthèse de l'ouvrage « Celluka e Mbinndiin Pulaar » (CERFLA, 2020) — règles
// d'orthographe et de grammaire pulaar qui font autorité pour l'assistant.
const CELLUKA_RULES = `RÈGLES PULAAR (orthographe & grammaire — source: Celluka e Mbinndiin Pulaar, CERFLA 2020) :

Alphabet pulaar (32 lettres) : ' a b ɓ c d ɗ e f g h i j k l m mb n nd ng nj ñ ŋ o p r s t u w y ƴ.
- 5 voyelles (laaɓɗe) : a e i o u, qui peuvent être brèves (daɓɓe) ou longues (duurtuɗe : aa, ee, ii, oo, uu).
- La longueur change le sens : « hirde » ≠ « hiirde », « horde » ≠ « hoorde ».
- Consonnes spéciales obligatoires : ɓ ɗ ƴ ŋ ñ. Ne JAMAIS écrire b/d/y à la place.
- Prénasalisées : mb, nd, ng, nj.
- Géminées possibles : bb, dd, ll, mm, nn, pp, tt, kk, ƴƴ…

Mots (helmere) : composés d'une ou plusieurs syllabes (hijjannɗe). Une syllabe peut être réduite à une voyelle (a, o, e) ou commencer par un coup de glotte ' (Ɂ majuscule).

Nom (innde) : désigne une personne, une chose, un animal ou un lieu. Le nom porte une racine (ɗaɗol) et une terminaison de classe (fooɓre). Exemples : neɗɗo (personne), puccu (cheval), suudu (case).

Verbe (baɗal) : exprime une action. Deux types principaux : 
- baɗal muumal (verbe à l'infinitif, terminé en -ude / -de / -gol) ex. janngude (étudier).
- baɗal pirlitaangal (verbe conjugué) : la racine reçoit des terminaisons (MFC) : -i (accompli), -aani (négatif accompli), -ataa (négatif inaccompli), -ii, -aama, -aaka, -etee, etaake, etc. Ex. racine janng- → janngi, janngaani, janngataa.

Phrase (konngol) : suite ordonnée de mots formant un sens complet. Commence par une majuscule, finit par . ! ? Ponctuation : virgule (,), deux-points (:), point-virgule (;), points de suspension (…).

Classes nominales : chaque nom appartient à une classe (o, ngal, ndi, ndu, ɗum, ɗe, ɗi, ɓe, kal, kol, ka, ki, ko, nde, nge, ngo, ngu, ɗam…) ; l'accord se fait avec déterminants et adjectifs.

CONSIGNE D'USAGE : Quand tu produis du pulaar, applique strictement cet alphabet et ces accords. Si un mot n'utilise pas ɓ/ɗ/ƴ/ŋ alors qu'il le devrait, corrige-le. Indique brièvement la classe nominale ou la racine verbale quand c'est pédagogique.`;

const LANG_INSTRUCTIONS: Record<string, string> = {
  fr: "Réponds en français, mais donne TOUJOURS en priorité les équivalents/exemples en Pulaar (caractères ɓ ɗ ƴ ŋ corrects).",
  ff: "Jaabo SAHA fof e ɗemngal Pulaar/Fulfulde tan, huutoraa alkule ɓ, ɗ, ƴ, ŋ no haaniri. So a anndaa, wi'u 'mi anndaa'.",
  en: "Answer in English, but ALWAYS prioritize Pulaar equivalents/examples (with correct ɓ ɗ ƴ ŋ).",
  ar: "أجب بالعربية، مع إعطاء الأولوية دائمًا للمكافئات والأمثلة بالبولارية (مع الأحرف ɓ ɗ ƴ ŋ الصحيحة).",
};

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 2000;
const STOPWORDS = new Set([
  "le","la","les","un","une","des","de","du","et","ou","mais","est","sont","ce","cette","ces","que","qui","quoi","comment","pourquoi","où","quand","mon","ma","mes","ton","ta","tes","son","sa","ses","je","tu","il","elle","nous","vous","ils","elles","pour","avec","dans","sur","sous","par","en","au","aux","a","à","the","is","are","what","how","why","where","when","my","your","his","her","our","their","i","you","he","she","we","they","for","with","in","on","by","at","of","and","or","but","this","that",
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\s'’ɓɗƴŋ-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    .slice(0, 12);
}

async function fetchDictionaryContext(supabase: ReturnType<typeof createClient>, lastUserMsg: string) {
  const keywords = extractKeywords(lastUserMsg);
  if (keywords.length === 0) return "";
  const orFilter = keywords
    .flatMap((k) => {
      const safe = k.replace(/[,()]/g, "");
      return [`pulaar.ilike.%${safe}%`, `french.ilike.%${safe}%`, `english.ilike.%${safe}%`, `arabic.ilike.%${safe}%`];
    })
    .join(",");
  const { data, error } = await supabase
    .from("dictionary_entries")
    .select("pulaar,french,english,arabic,pronunciation,example_pulaar,example_french,category")
    .or(orFilter)
    .limit(10);
  if (error || !data || data.length === 0) return "";
  const lines = data.map((e: any) => {
    const parts = [`• **${e.pulaar}**`];
    if (e.pronunciation) parts.push(`/${e.pronunciation}/`);
    parts.push(`— FR: ${e.french}`);
    if (e.english) parts.push(`| EN: ${e.english}`);
    if (e.arabic) parts.push(`| AR: ${e.arabic}`);
    if (e.example_pulaar) parts.push(`\n   ex: « ${e.example_pulaar} »${e.example_french ? ` (${e.example_french})` : ""}`);
    return parts.join(" ");
  });
  return `\n\n=== DICTIONNAIRE DE RÉFÉRENCE (entrées vérifiées correspondant à la question) ===\n${lines.join("\n")}\n=== Fin du dictionnaire ===`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    // Auth is optional — assistant is accessible to visitors and signed-in users alike.
    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      authHeader ? { global: { headers: { Authorization: authHeader } } } : undefined,
    );

    const body = await req.json();
    const messages = body?.messages;
    const langRaw = typeof body?.lang === "string" ? body.lang : "fr";
    const lang = ["fr", "ff", "en", "ar"].includes(langRaw) ? langRaw : "fr";
    const dialectRaw = typeof body?.dialect === "string" ? body.dialect : "fouta_toro";
    const DIALECT_LABELS: Record<string, string> = {
      fouta_toro: "Pulaar du Fuuta Tooro (Sénégal, Mauritanie, Mali)",
      fouta_djallon: "Pular du Fuuta Jaloo (Guinée)",
      maasina: "Fulfulde du Maasina (Mali, Burkina, Niger)",
      aadamaawa: "Fulfulde de l'Aadamaawa (Nigeria, Cameroun, Tchad)",
    };
    const dialectLabel = DIALECT_LABELS[dialectRaw] ?? DIALECT_LABELS.fouta_toro;

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(JSON.stringify({ error: "Requête invalide." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const safeMessages = messages
      .filter((m: any) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m: any) => ({ role: m.role, content: String(m.content).slice(0, MAX_CONTENT_LENGTH) }));

    if (safeMessages.length === 0) {
      return new Response(JSON.stringify({ error: "Requête invalide." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "Service indisponible." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // RAG: search dictionary for keywords in the last user message
    const lastUser = [...safeMessages].reverse().find((m) => m.role === "user");
    const dictContext = lastUser ? await fetchDictionaryContext(supabase, lastUser.content) : "";

    const dialectInstruction = `\n\nDIALECTE PRIVILÉGIÉ : Quand tu donnes des mots, exemples ou citations en Pulaar/Fulfulde, privilégie le ${dialectLabel}. Si une forme diffère sensiblement dans d'autres dialectes, tu peux la signaler brièvement, mais la forme principale doit être celle de ce dialecte.`;

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${CELLUKA_RULES}\n\n${FOUNDER_BIO}\n\n${LANG_INSTRUCTIONS[lang]}${dialectInstruction}${dictContext}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...safeMessages],
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Limite atteinte. Réessayez plus tard." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok || !resp.body) {
      console.error("Upstream AI gateway error:", resp.status, await resp.text());
      return new Response(JSON.stringify({ error: "Une erreur est survenue." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(resp.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (e) {
    console.error("chat function error:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
