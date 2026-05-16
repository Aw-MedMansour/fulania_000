import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles, Loader2 } from "lucide-react";
import { SiteFooter } from "@/components/layout";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Comment dit-on « bonjour » en Pulaar ?",
  "Explique-moi le Pulaaku en quelques phrases.",
  "Qui était El Hadj Oumar Tall ?",
  "Donne-moi 3 proverbes peuls avec leur sens.",
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat`;

function ChatPage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!resp.ok || !resp.body) {
        const errJson = await resp.json().catch(() => ({ error: "Erreur réseau" }));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }

      // Stream SSE
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: assistant };
                return copy;
              });
            }
          } catch {
            /* ignore */
          }
        }
      }
    } catch (e) {
      setError((e as Error).message);
      setMessages((m) => m.slice(0, -1)); // remove empty assistant on hard error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
              <span className="font-display text-lg font-bold">F</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-semibold">FulanIA</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Assistant IA
              </span>
            </div>
          </div>
          <div className="w-16" />
        </div>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="mx-auto max-w-2xl py-12 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold sm:text-4xl">
              Salaam alaykum 👋
            </h1>
            <p className="mt-3 text-muted-foreground">
              Posez-moi vos questions sur la langue Pulaar, la culture Peule, l'histoire des
              Halpulaar — en français, Pulaar, arabe ou anglais.
            </p>
            <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground/85 transition hover:border-primary/50 hover:bg-primary/5"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((m, i) => (
              <MessageBubble key={i} role={m.role} content={m.content} />
            ))}
            {loading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                FulanIA réfléchit…
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="mx-auto flex max-w-4xl items-end gap-2 px-4 py-4"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            rows={1}
            placeholder="Écrivez en français, Pulaar, arabe…"
            className="max-h-40 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Envoyer"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <p className="pb-3 text-center text-[11px] text-muted-foreground">
          FulanIA est en phase bêta — les réponses peuvent contenir des erreurs.
        </p>
      </div>

      <SiteFooter />
    </div>
  );
}

function MessageBubble({ role, content }: Msg) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        <div
          className={`flex h-9 w-9 flex-none items-center justify-center rounded-full font-display text-sm font-bold ${
            isUser ? "bg-primary text-primary-foreground" : "bg-earth text-[var(--gold)]"
          }`}
        >
          {isUser ? "Vo" : "F"}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-card text-foreground"
          }`}
        >
          {content || <span className="opacity-50">…</span>}
        </div>
      </div>
    </div>
  );
}
