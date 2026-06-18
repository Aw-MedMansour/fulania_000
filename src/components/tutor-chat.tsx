import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import ReactMarkdown from "react-markdown";
import { Sparkles, X, Send, Loader2, Volume2 } from "lucide-react";
import { askTutor, type TutorContext, type TutorMsg } from "@/lib/tutor.functions";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "fr-FR";
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function TutorChat({
  context,
  onClose,
}: {
  context: TutorContext;
  onClose: () => void;
}) {
  const ask = useServerFn(askTutor);
  const [messages, setMessages] = useState<TutorMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "Comment prononcer ce mot ?",
    "Donne-moi un exemple de phrase",
    "Un mot proche en Pulaar ?",
    "Raconte une anecdote culturelle",
  ];

  useEffect(() => {
    scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setLoading(true);
    try {
      const { reply } = await ask({ data: { context, messages: next } });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      console.error(e);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Désolé, je n'ai pas pu répondre. Réessaye." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const intro =
    context.pulaar && context.french
      ? `Je peux t'aider avec **${context.pulaar}** (${context.french}). Pose-moi une question !`
      : `Je suis ton tuteur Janngude. Pose-moi n'importe quoi sur le Pulaar !`;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center">
      <div className="flex h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-border bg-background shadow-2xl sm:h-[80vh] sm:rounded-3xl">
        {/* Header */}
        <div className="flex flex-none items-center gap-3 border-b border-border/60 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--terracotta)] text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-base font-semibold leading-tight">Tuteur Janngude</p>
            <p className="truncate text-xs text-muted-foreground">
              {context.pulaar ? `Mot : ${context.pulaar}` : "Apprentissage du Pulaar"}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollerRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <Bubble role="assistant">
            <Markdown text={intro} />
          </Bubble>

          {messages.map((m, i) => (
            <Bubble key={i} role={m.role}>
              <Markdown text={m.content} />
              {m.role === "assistant" && (
                <button
                  onClick={() => speak(m.content.replace(/[*_`#]/g, ""))}
                  className="mt-1.5 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  <Volume2 className="h-3 w-3" /> Écouter
                </button>
              )}
            </Bubble>
          ))}

          {loading && (
            <Bubble role="assistant">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Janngude réfléchit…
              </span>
            </Bubble>
          )}

          {messages.length === 0 && !loading && (
            <div className="flex flex-wrap gap-2 pt-1">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:border-[var(--gold)] hover:bg-[var(--gold)]/10"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="flex-none border-t border-border/60 bg-card/50 p-3">
          <div className="flex items-end gap-2">
            <textarea
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              rows={1}
              placeholder="Pose ta question…"
              className="flex-1 resize-none rounded-2xl border border-border bg-background px-4 py-2.5 text-sm focus:border-[var(--gold)] focus:outline-none"
              disabled={loading}
            />
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-full"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          role === "user"
            ? "bg-[var(--gold)] text-white rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Markdown({ text }: { text: string }) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-strong:font-display prose-strong:italic prose-strong:text-[var(--terracotta)] dark:prose-strong:text-[var(--gold)]">
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );
}
