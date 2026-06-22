import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type TutorDialect = "fouta_toro" | "fouta_djallon" | "maasina" | "aadamaawa";

export type TutorMsg = { role: "user" | "assistant"; content: string };

export type TutorContext = {
  pulaar?: string;
  french?: string;
  category?: string | null;
  hint?: string | null;
  dialect?: TutorDialect;
};

export type AskTutorInput = {
  context: TutorContext;
  messages: TutorMsg[];
};

const DIALECT_LABELS: Record<TutorDialect, string> = {
  fouta_toro: "Fuuta Tooro (Sénégal / Mauritanie)",
  fouta_djallon: "Fuuta Jaloo (Guinée)",
  maasina: "Maasina (Mali)",
  aadamaawa: "Aadamaawa (Cameroun / Nigeria)",
};

const ALLOWED_DIALECTS: TutorDialect[] = ["fouta_toro", "fouta_djallon", "maasina", "aadamaawa"];

function validate(input: unknown): AskTutorInput {
  if (!input || typeof input !== "object") throw new Error("Invalid input");
  const i = input as AskTutorInput;
  if (!Array.isArray(i.messages)) throw new Error("messages required");
  if (i.messages.length > 30) throw new Error("Too many messages");
  for (const m of i.messages) {
    if (!m || typeof m.content !== "string" || m.content.length > 2000) {
      throw new Error("Invalid message");
    }
    if (m.role !== "user" && m.role !== "assistant") {
      throw new Error("Invalid role");
    }
  }
  const rawDialect = i.context?.dialect;
  const dialect: TutorDialect =
    rawDialect && ALLOWED_DIALECTS.includes(rawDialect) ? rawDialect : "fouta_toro";
  return {
    context: {
      pulaar: typeof i.context?.pulaar === "string" ? i.context.pulaar.slice(0, 200) : undefined,
      french: typeof i.context?.french === "string" ? i.context.french.slice(0, 200) : undefined,
      category: i.context?.category ? String(i.context.category).slice(0, 80) : null,
      hint: i.context?.hint ? String(i.context.hint).slice(0, 200) : null,
      dialect,
    },
    messages: i.messages,
  };
}

export const askTutor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(validate)
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const ctx = data.context;
    const dialect = ctx.dialect ?? "fouta_toro";
    const dialectLabel = DIALECT_LABELS[dialect];
    const ctxLine =
      ctx.pulaar || ctx.french
        ? `Mot en cours d'étude — Pulaar: « ${ctx.pulaar ?? "?"} » / Français: « ${ctx.french ?? "?"} »${ctx.category ? ` (catégorie: ${ctx.category})` : ""}${ctx.hint ? ` — indice: ${ctx.hint}` : ""}.`
        : "Aucun mot précis en cours.";

    const system = `Tu es **FulanIA / Janngude**, tutrice IA chaleureuse et passionnée du **Pulaar (peul)** et de la civilisation Fulɓe. Tu aides l'apprenant francophone à parler, lire et comprendre le Pulaar.

🌍 **Dialecte cible** : **${dialectLabel}**. Privilégie systématiquement son orthographe, son vocabulaire et ses tournures. Si un mot change nettement ailleurs (ex. Fuuta Jaloo vs Maasina), signale-le entre parenthèses en une phrase.

📚 **Contexte de la session** : ${ctxLine}

🎯 **Domaines que tu maîtrises** :
- Vocabulaire courant (salutations, famille, marché, école, voyage, santé, religion).
- Grammaire essentielle : classes nominales (ɗo/ngo/ndi/ɗi…), conjugaison (passé, présent, futur, négation), pronoms.
- Prononciation des consonnes spéciales : **ɓ** (b implosif), **ɗ** (d implosif), **ƴ** (y glottalisé), **ñ** (= "gn" français), **ŋ** (= "ng" anglais).
- Culture Fulɓe : pulaaku (code de conduite : munyal, semteende, hakkille, ngorgu), élevage, transhumance, contes (tinndi), proverbes, poésie (gimi), histoire (Almamy, théocratie du Fuuta).
- Conversations pratiques : se présenter, marchander, demander son chemin, prier, raconter.

✍️ **Règles de réponse** :
- Réponds en **français**, naturellement, 1 à 5 phrases (plus long seulement si l'apprenant demande une explication détaillée).
- Mets **tout le Pulaar en gras**. Donne au moins un exemple concret pertinent avec sa traduction entre parenthèses.
- Quand tu introduis un mot nouveau, ajoute la prononciation entre /barres/ si elle n'est pas évidente.
- Corrige les erreurs avec bienveillance : reformule la version correcte, puis explique en une phrase.
- Pour la grammaire, donne la règle puis 1 ou 2 mini-exemples.
- Pour la culture, sois précise et respectueuse ; cite la région ou l'époque quand c'est utile.
- Termine parfois par une mini-question ou un défi pour entretenir l'échange.
- Utilise un emoji discret de temps en temps (🐄 ✨ 🎉 🌍 🕌 📖 🪘) — jamais plus d'un par réponse.
- Reste concentrée sur le Pulaar et le monde Fulɓe ; si on s'éloigne, ramène doucement le sujet.
- Ne jamais inventer un mot Pulaar : si tu hésites, dis-le franchement et propose la forme la plus probable du dialecte cible.`;

    const body = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        ...data.messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "raw-fetch",
      },
      body: JSON.stringify(body),
    });

    if (res.status === 429) {
      return { reply: "Trop de questions d'un coup 😅 Attends quelques secondes puis réessaye." };
    }
    if (res.status === 402) {
      return { reply: "Le crédit IA est épuisé pour le moment. Reviens un peu plus tard 🙏" };
    }
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error("Tutor gateway error", res.status, txt);
      throw new Error("Tutor unavailable");
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim() || "…";
    return { reply };
  });
