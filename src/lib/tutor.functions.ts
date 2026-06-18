import { createServerFn } from "@tanstack/react-start";

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

    const system = `Tu es Janngude, un tuteur IA chaleureux qui aide à apprendre le **Pulaar (peul)** depuis le français.

Dialecte préféré de l'apprenant : **${dialectLabel}**. Privilégie la variante, l'orthographe et les exemples de ce dialecte. Si un mot diffère sensiblement dans d'autres dialectes, signale-le brièvement entre parenthèses.

${ctxLine}

Règles :
- Réponds en français, brièvement (1 à 4 phrases), comme un ami patient.
- Donne toujours un exemple concret en Pulaar (${dialectLabel}) quand c'est utile, suivi de la traduction française entre parenthèses.
- Mets le Pulaar en **gras**.
- Si l'apprenant se trompe, corrige avec douceur et explique en une phrase.
- Pour la prononciation, décris-la simplement (ex: "« ñ » se prononce comme le « gn » de campagne").
- Encourage : utilise un emoji approprié de temps en temps (🐄 ✨ 🎉 🌍 🕌).
- Reste concentré sur le Pulaar et la culture peule.`;

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
