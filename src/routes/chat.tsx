import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Send, Sparkles, Loader2, LogIn, Check, ChevronDown, Languages } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SiteFooter } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGES, useLanguage, type Lang } from "@/hooks/use-language";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat`;
const CHAT_LANG_KEY = "fulania.chat.lang";

function ChatPage() {
  const { session, loading: authLoading } = useAuth();
  const { t, lang: siteLang } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatLang, setChatLangState] = useState<Lang>(siteLang);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Init chat language from storage (or fallback to site lang)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_LANG_KEY) as Lang | null;
      if (stored && LANGUAGES.find((l) => l.code === stored)) setChatLangState(stored);
      else setChatLangState(siteLang);
    } catch { setChatLangState(siteLang); }
  }, [siteLang]);

  const setChatLang = (l: Lang) => {
    setChatLangState(l);
    try { localStorage.setItem(CHAT_LANG_KEY, l); } catch {}
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const suggestions = useMemo(() => [
    t("chat.sug1"), t("chat.sug2"), t("chat.sug3"), t("chat.sug4"),
  ], [t]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;
    setError(null);

    const { data: { session: current } } = await supabase.auth.getSession();
    if (!current?.access_token) {
      setError(t("chat.errAuth"));
      return;
    }

    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${current.access_token}`,
        },
        body: JSON.stringify({ messages: next.slice(-20), lang: chatLang }),
      });

      if (!resp.ok || !resp.body) {
        const errJson = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }

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
          } catch { /* ignore */ }
        }
      }
    } catch (e) {
      setError((e as Error).message);
      setMessages((m) => m.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />{t("chat.back")}
          </Link>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
              <span className="font-display text-lg font-bold">F</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-semibold">FulanIA</span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                {t("chat.subtitle")}
              </span>
            </div>
          </div>
          <ChatLangSelector value={chatLang} onChange={setChatLang} label={t("chat.replyIn")} />
        </div>
      </header>

      <div ref={scrollRef} className="mx-auto w-full max-w-4xl flex-1 overflow-y-auto px-4 py-8">
        <h1 className="sr-only">{t("chat.srTitle")}</h1>
        {!authLoading && !session ? (
          <div className="mx-auto max-w-md py-16 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <LogIn className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold">{t("chat.authNeeded")}</h2>
            <p className="mt-3 text-muted-foreground">{t("chat.authBody")}</p>
            <Link to="/auth" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {t("chat.signin")}
            </Link>
          </div>
        ) : messages.length === 0 ? (
          <div className="mx-auto max-w-2xl py-12 text-center">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-semibold sm:text-4xl">{t("chat.hello")}</h2>
            <p className="mt-3 text-muted-foreground">{t("chat.intro")}</p>
            <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
              {suggestions.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground/85 transition hover:border-primary/50 hover:bg-primary/5">
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
                <Loader2 className="h-4 w-4 animate-spin" />{t("chat.thinking")}
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

      <div className="sticky bottom-0 border-t border-border bg-background/90 backdrop-blur">
        <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mx-auto flex max-w-4xl items-end gap-2 px-4 py-4">
          <textarea
            id="chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.aria.msg")}
            className="max-h-40 flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("chat.send")}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <p className="pb-3 text-center text-[11px] text-muted-foreground">{t("chat.beta")}</p>
      </div>

      <SiteFooter />
    </div>
  );
}

function ChatLangSelector({ value, onChange, label }: { value: Lang; onChange: (l: Lang) => void; label: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-2 text-xs font-medium text-foreground/80 hover:bg-accent"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={label}
      >
        <Languages className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{current.code.toUpperCase()}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <ul role="listbox" className="absolute end-0 z-50 mt-2 w-56 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          <li className="border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </li>
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                role="option"
                aria-selected={l.code === value}
                onClick={() => { onChange(l.code); setOpen(false); }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden>{l.flag}</span>
                  <span>{l.native}</span>
                </span>
                {l.code === value && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MessageBubble({ role, content }: Msg) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[85%] gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-full font-display text-sm font-bold ${isUser ? "bg-primary text-primary-foreground" : "bg-earth text-[var(--gold)]"}`}>
          {isUser ? "Vo" : "F"}
        </div>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? "bg-primary text-primary-foreground whitespace-pre-wrap" : "border border-border bg-card text-foreground"}`}>
          {content ? (
            isUser ? content : (
              <div className="prose prose-sm max-w-none prose-p:my-2 prose-p:leading-relaxed prose-strong:text-earth prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-headings:font-display prose-headings:text-earth prose-headings:mt-3 prose-headings:mb-1.5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:bg-muted prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            )
          ) : (
            <span className="opacity-50">…</span>
          )}
        </div>
      </div>
    </div>
  );
}
