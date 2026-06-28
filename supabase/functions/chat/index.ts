// FulanIA — Assistant IA edge function with dictionary RAG, web search & multimodal
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

PIÈCES JOINTES (règle générale — TOUJOURS appliquée) :
- Les fichiers et photos joints par l'utilisateur sont une SOURCE PRIMAIRE. Tu DOIS les exploiter pour enrichir TOUTES tes réponses, quelle que soit la fonctionnalité (traduction, explication culturelle, correction d'orthographe Pulaar, transcription, résumé, comparaison avec le dictionnaire, recherche web, etc.).
- Images : décris-les avec précision, lis tout texte visible (OCR mental), corrige l'orthographe Pulaar si nécessaire, identifie objets/lieux/personnes/symboles culturels Peuls pertinents.
- PDF / documents : lis le contenu, cite des passages exacts entre guillemets, résume, traduis ou analyse selon la question.
- Textes (.txt, .md) : leur contenu est injecté ci-dessous ; utilise-le comme contexte de référence.
- Si un fichier contient des mots Pulaar, croise-les avec le DICTIONNAIRE DE RÉFÉRENCE et signale toute correction.
- Si la question de l'utilisateur est courte ou vague mais qu'un fichier est joint, considère le fichier comme la question principale et réponds en t'appuyant dessus.
- Ne dis JAMAIS « je ne peux pas lire ce fichier » si une pièce jointe valide est fournie — exploite-la.

MODE COACH / TUTEUR DE CARTES (Janngude) :
- Quand le message de l'utilisateur contient un bloc « CONTEXTE CARTE » (avec un mot Pulaar, sa traduction, éventuellement une catégorie ou un indice), passe en mode coach pédagogique court : réponse chaleureuse, encourageante, 1 à 4 phrases maximum, un exemple concret en Pulaar avec sa traduction, et si pertinent une note de prononciation écrite (pas d'audio).
- Réagis directement à la question liée à la carte (« comment prononcer ? », « un exemple ? », « pourquoi cette forme ? », « racine du mot ? »).
- Reste fidèle au dictionnaire fourni et au dialecte privilégié de l'utilisateur.
- Pas de longue dissertation ni de listes interminables en mode carte ; un griot bienveillant qui aide à mémoriser un mot.

Style : chaleureux, pédagogue, comme un griot moderne. Markdown bien structuré (titres, listes, gras). Concis par défaut, détaillé sur demande.`;

const CELLUKA_RULES = `RÈGLES PULAAR (orthographe & grammaire — source: Celluka e Mbinndiin Pulaar, CERFLA 2020) :

Alphabet pulaar (32 lettres) : ' a b ɓ c d ɗ e f g h i j k l m mb n nd ng nj ñ ŋ o p r s t u w y ƴ.
- 5 voyelles (laaɓɗe) : a e i o u, brèves (daɓɓe) ou longues (duurtuɗe : aa, ee, ii, oo, uu).
- La longueur change le sens : « hirde » ≠ « hiirde », « horde » ≠ « hoorde ».
- Consonnes spéciales obligatoires : ɓ ɗ ƴ ŋ ñ. Ne JAMAIS écrire b/d/y à la place.
- Prénasalisées : mb, nd, ng, nj. Géminées possibles : bb, dd, ll, mm, nn, pp, tt, kk, ƴƴ…

Verbe (baɗal) : infinitif -ude/-de/-gol (ex. janngude). Conjugué : -i, -aani, -ataa, -ii, -aama, -aaka, -etee, etaake…
Classes nominales : o, ngal, ndi, ndu, ɗum, ɗe, ɗi, ɓe, kal, kol, ka, ki, ko, nde, nge, ngo, ngu, ɗam…

CONSIGNE : Applique strictement cet alphabet et ces accords. Corrige tout mot mal orthographié.`;

const LANG_INSTRUCTIONS: Record<string, string> = {
  fr: "Réponds en français, mais donne TOUJOURS en priorité les équivalents/exemples en Pulaar (caractères ɓ ɗ ƴ ŋ corrects).",
  ff: "Jaabo SAHA fof e ɗemngal Pulaar/Fulfulde tan, huutoraa alkule ɓ, ɗ, ƴ, ŋ no haaniri. So a anndaa, wi'u 'mi anndaa'.",
  en: "Answer in English, but ALWAYS prioritize Pulaar equivalents/examples (with correct ɓ ɗ ƴ ŋ).",
  ar: "أجب بالعربية، مع إعطاء الأولوية دائمًا للمكافئات والأمثلة بالبولارية (مع الأحرف ɓ ɗ ƴ ŋ الصحيحة).",
};

const MAX_MESSAGES = 20;
const MAX_CONTENT_LENGTH = 4000;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 8 * 1024 * 1024; // 8 MB / fichier
const ALLOWED_MIME = /^(image\/(png|jpe?g|webp|gif)|application\/pdf|text\/(plain|markdown))$/i;

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

const BLOCKED_DOMAINS = [
  "pornhub", "xvideos", "xnxx", "xhamster", "redtube", "youporn", "brazzers",
  "onlyfans", "chaturbate", "stripchat", "livejasmin", "cam4", "bongacams",
  "spankbang", "tnaflix", "eporner", "hclips", "nhentai", "hentai-",
  "rule34", "e621", "fapello", "motherless", "thothub", "erome", "missav",
];
const BLOCKED_KEYWORDS = [
  "porn", "porno", " xxx", "hentai", " nude", " nudes", "naked sex",
  "escort", "camgirl", "onlyfans", "nsfw", "fetish", "erotic", "erotique",
  "adult video", "sexe explicite",
];

function isUnsafeResult(r: any): boolean {
  const url = String(r?.url ?? "").toLowerCase();
  const text = ` ${(r?.title ?? "")} ${(r?.description ?? r?.snippet ?? "")}`.toLowerCase();
  if (BLOCKED_DOMAINS.some((d) => url.includes(d))) return true;
  if (BLOCKED_KEYWORDS.some((k) => text.includes(k))) return true;
  return false;
}

// Allowlist : mots-clés liés au Pulaar / Fulfulde / Halpulaar / dialectes & culture Peule.
// Un résultat doit contenir AU MOINS un de ces termes (URL, titre ou description) pour être conservé.
const PULAAR_TOPIC_KEYWORDS = [
  "pulaar", "pular", "fulfulde", "fulani", "fulɓe", "fulbe", "fula", "peul", "peule", "peuls", "peules",
  "halpulaar", "haalpulaar", "haalpulaar'en", "toucouleur", "tukulor",
  "fuuta", "fouta", "fuuta tooro", "fouta toro", "fuuta jaloo", "fouta djallon", "djallon",
  "maasina", "macina", "aadamaawa", "adamawa", "sokoto",
  "pulaaku", "semteende", "munyal", "hakkiilo", "neddaaku",
  "ceerno", "thierno", "almamy", "almami", "el hadj oumar", "oumar tall", "souleymane baal",
  "hoddu", "riti", "yela", "leele", "gumbala",
  "celluka", "cerfla", "ajami",
];

// Domaines de confiance (toujours acceptés s'ils ne sont pas bloqués par BLOCKED_DOMAINS).
const PULAAR_TRUSTED_DOMAINS = [
  "fulania.com", "webpulaar.com", "pulaagu.com", "tabital-pulaaku", "timpulaaku",
  "ethnologue.com", "glottolog.org", "wikipedia.org", "wiktionary.org",
  "unesco.org", "openlibrary.org", "cerfla", "sil.org",
];

function isOnTopicResult(r: any): boolean {
  const url = String(r?.url ?? "").toLowerCase();
  const text = `${(r?.title ?? "")} ${(r?.description ?? r?.snippet ?? "")}`.toLowerCase();
  if (PULAAR_TRUSTED_DOMAINS.some((d) => url.includes(d))) return true;
  return PULAAR_TOPIC_KEYWORDS.some((k) => url.includes(k) || text.includes(k));
}

async function fetchWebSearchContext(query: string, deep = false): Promise<{ context: string; sources: { title: string; url: string }[] }> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) return { context: "", sources: [] };
  const q = ` ${query.toLowerCase()} `;
  if (BLOCKED_KEYWORDS.some((k) => q.includes(k))) {
    return { context: "", sources: [] };
  }
  const queryLower = query.toLowerCase();
  const isPulaarTopic = PULAAR_TOPIC_KEYWORDS.some((k) => queryLower.includes(k));
  const scopedQuery = isPulaarTopic
    ? `${query} (Pulaar OR Fulfulde OR Pular OR Fulani OR Peul OR Halpulaar OR "Fuuta Tooro" OR "Fouta Djallon" OR Maasina OR Aadamaawa)`
    : query;
  const searchLimit = deep ? 25 : 15;
  const keepLimit = deep ? 15 : 10;
  const perPageChars = deep ? 3500 : 1500;
  try {
    const resp = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: scopedQuery,
        limit: searchLimit,
        scrapeOptions: { formats: ["markdown"], onlyMainContent: true },
      }),
    });

    if (!resp.ok) {
      console.error("Firecrawl search error:", resp.status, await resp.text());
      return { context: "", sources: [] };
    }
    const json = await resp.json();
    const raw = (json?.data?.web ?? json?.data ?? json?.web ?? []) as any[];
    if (!Array.isArray(raw) || raw.length === 0) return { context: "", sources: [] };
    const safe = raw.filter((r) => !isUnsafeResult(r));
    const ordered = isPulaarTopic
      ? [...safe.filter(isOnTopicResult), ...safe.filter((r) => !isOnTopicResult(r))].slice(0, keepLimit)
      : safe.slice(0, keepLimit);

    if (ordered.length === 0) return { context: "", sources: [] };
    const sources = ordered.map((r) => ({ title: r.title ?? r.url, url: r.url }));
    const lines = ordered.map((r, i) => {
      const content = (r.markdown || r.description || r.snippet || "").toString().slice(0, perPageChars);
      return `[${i + 1}] ${r.title ?? r.url}\n${r.url}\n${content}`;
    });
    const header = deep ? "RECHERCHE WEB APPROFONDIE" : "RECHERCHE WEB";
    const method = deep
      ? `MÉTHODE (RECHERCHE APPROFONDIE) : Tu as ${ordered.length} sources avec leur contenu complet. Analyse-les en profondeur AVANT de répondre. Compare, croise, identifie les convergences et divergences. Structure ta réponse en sections claires (contexte, points clés, nuances, conclusion). Cite TOUTES les sources avec [1], [2], etc. au fil du texte. Fournis une synthèse longue, détaillée et nuancée — pas un simple résumé. Sur les sujets Pulaar/Fulfulde/culture Peule, priorise les sources spécialisées. Ne mentionne ni ne cite aucun contenu pornographique, escort, NSFW ou pour adultes.`
      : `MÉTHODE : Lis ces extraits AVANT de répondre. Synthétise, croise avec tes connaissances. Cite tes sources avec [1], [2], etc. au fil du texte. Sur les sujets liés au Pulaar/Fulfulde/culture Peule, donne priorité aux sources spécialisées. Sur tout autre sujet (sciences, actualité, technologie, histoire générale, etc.), exploite librement les meilleures sources disponibles pour donner une réponse intelligente et complète. Ne mentionne ni ne cite aucun site pornographique, escort, NSFW, hentai ou contenu pour adultes.`;
    return {
      context: `\n\n=== ${header} (contenu extrait des pages) ===\n${lines.join("\n\n---\n\n")}\n=== Fin de la recherche ===\n\n${method}`,
      sources,
    };
  } catch (e) {
    console.error("Firecrawl request failed:", e);
    return { context: "", sources: [] };
  }
}

type Attachment = { name: string; mimeType: string; dataBase64: string };

function validateAttachments(input: unknown): Attachment[] {
  if (!Array.isArray(input)) return [];
  const out: Attachment[] = [];
  for (const a of input.slice(0, MAX_ATTACHMENTS)) {
    if (!a || typeof a !== "object") continue;
    const { name, mimeType, dataBase64 } = a as any;
    if (typeof name !== "string" || typeof mimeType !== "string" || typeof dataBase64 !== "string") continue;
    if (!ALLOWED_MIME.test(mimeType)) continue;
    // base64 length approximation: bytes ≈ len * 0.75
    if (dataBase64.length * 0.75 > MAX_ATTACHMENT_BYTES) continue;
    out.push({ name: name.slice(0, 120), mimeType, dataBase64 });
  }
  return out;
}

function decodeTextAttachment(a: Attachment): string {
  try {
    const bin = atob(a.dataBase64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes).slice(0, 8000);
  } catch {
    return "";
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


    const body = await req.json();
    const messages = body?.messages;
    const langRaw = typeof body?.lang === "string" ? body.lang : "fr";
    const lang = ["fr", "ff", "en", "ar"].includes(langRaw) ? langRaw : "fr";
    const dialectRaw = typeof body?.dialect === "string" ? body.dialect : "fouta_toro";
    const webSearch = body?.webSearch === true;
    const deepSearch = body?.deepSearch === true;
    const attachments = validateAttachments(body?.attachments);

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

    const lastUser = [...safeMessages].reverse().find((m) => m.role === "user");
    const lastUserText = lastUser?.content ?? "";

    // Pre-decode text attachments so we can (a) enrich dictionary + web search queries
    // and (b) reuse them when building the multimodal user message below.
    const decodedTextAttachments = attachments
      .filter((a) => /^text\//i.test(a.mimeType))
      .map((a) => ({ name: a.name, text: decodeTextAttachment(a) }))
      .filter((t) => t.text.length > 0);
    const attachmentNames = attachments.map((a) => a.name).join(" ");
    const attachmentTextBlob = decodedTextAttachments.map((t) => t.text).join("\n").slice(0, 6000);
    const enrichedQuery = [lastUserText, attachmentNames, attachmentTextBlob].filter(Boolean).join("\n");

    // Run dictionary lookup + web search in parallel, enriched with attachment content
    const [dictContext, webResult] = await Promise.all([
      fetchDictionaryContext(supabase, enrichedQuery),
      (webSearch || deepSearch) && enrichedQuery ? fetchWebSearchContext(lastUserText || attachmentNames || "FulanIA", deepSearch) : Promise.resolve({ context: "", sources: [] }),
    ]);

    const dialectInstruction = `\n\nDIALECTE PRIVILÉGIÉ : Quand tu donnes des mots, exemples ou citations en Pulaar/Fulfulde, privilégie le ${dialectLabel}. Si une forme diffère sensiblement dans d'autres dialectes, tu peux la signaler brièvement, mais la forme principale doit être celle de ce dialecte.`;

    const attachmentsNotice = attachments.length > 0
      ? `\n\n=== PIÈCES JOINTES REÇUES (${attachments.length}) ===\n${attachments.map((a) => `• ${a.name} (${a.mimeType})`).join("\n")}\nExploite-les obligatoirement pour répondre.`
      : "";

    const systemPrompt = `${BASE_SYSTEM_PROMPT}\n\n${CELLUKA_RULES}\n\n${FOUNDER_BIO}\n\n${LANG_INSTRUCTIONS[lang]}${dialectInstruction}${attachmentsNotice}${dictContext}${webResult.context}`;

    // Inject attachments into the last user message (multimodal content array).
    const finalMessages: any[] = safeMessages.slice(0, -1);
    if (attachments.length > 0 && lastUser) {
      const parts: any[] = [];
      // Decode text attachments inline
      const textBlocks: string[] = [];
      for (const a of attachments) {
        if (/^image\//i.test(a.mimeType)) {
          parts.push({
            type: "image_url",
            image_url: { url: `data:${a.mimeType};base64,${a.dataBase64}` },
          });
        } else if (/^application\/pdf$/i.test(a.mimeType)) {
          // Gemini accepts PDF via image_url data URI as well
          parts.push({
            type: "image_url",
            image_url: { url: `data:${a.mimeType};base64,${a.dataBase64}` },
          });
        } else if (/^text\//i.test(a.mimeType)) {
          const txt = decodeTextAttachment(a);
          if (txt) textBlocks.push(`--- Fichier joint : ${a.name} ---\n${txt}\n--- fin ---`);
        }
      }
      const combinedText = [lastUser.content, ...textBlocks].filter(Boolean).join("\n\n");
      parts.push({ type: "text", text: combinedText || "(voir pièces jointes)" });
      finalMessages.push({ role: "user", content: parts });
    } else {
      finalMessages.push(lastUser!);
    }

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: deepSearch ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...finalMessages],
      }),
    });

    if (resp.status === 429) return new Response(JSON.stringify({ error: "Limite atteinte. Réessayez plus tard." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok || !resp.body) {
      console.error("Upstream AI gateway error:", resp.status, await resp.text());
      return new Response(JSON.stringify({ error: "Une erreur est survenue." }), { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Stream the AI body, then append a sources event the client can parse.
    const sourcesHeader = webResult.sources.length
      ? `data: ${JSON.stringify({ sources: webResult.sources })}\n\n`
      : "";

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        if (sourcesHeader) controller.enqueue(encoder.encode(sourcesHeader));
        const reader = resp.body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    });

    return new Response(stream, { headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
  } catch (e) {
    console.error("chat function error:", e);
    return new Response(JSON.stringify({ error: "Une erreur est survenue." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
