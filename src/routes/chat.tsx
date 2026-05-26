import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Send, Sparkles, Loader2, Check, ChevronDown, Languages, Globe, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { LANGUAGES, DIALECTS, useLanguage, getCurrentLang, tFor, type Lang, type Dialect } from "@/hooks/use-language";
import { PageNav } from "@/components/page-nav";

type Source = { title: string; url: string };
type Attachment = { name: string; mimeType: string; dataBase64: string; previewUrl?: string };

export const Route = createFileRoute("/chat")({
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./chat.title") },
        { name: "description", content: tFor(l, "seo./chat.desc") },
        { property: "og:title", content: tFor(l, "seo./chat.title") },
        { property: "og:description", content: tFor(l, "seo./chat.desc") },
        { property: "og:url", content: "https://fulania.com/chat" },
      ],
    };
  },
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string; sources?: Source[] };

const MAX_ATTACHMENTS = 5;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,application/pdf,text/plain,text/markdown";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const res = reader.result as string;
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/chat`;

function ChatPage() {
  const { t, lang: siteLang, setLang, dialect, setDialect } = useLanguage();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [webSearch, setWebSearch] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat language IS the global site language — single source of truth.
  const chatLang = siteLang;
  const setChatLang = setLang;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 200) + "px";
  }, [input]);

  const suggestions = useMemo(() => [
    t("chat.sug1"), t("chat.sug2"), t("chat.sug3"), t("chat.sug4"),
  ], [t]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    const list = Array.from(files).slice(0, remaining);
    const added: Attachment[] = [];
    for (const f of list) {
      if (f.size > MAX_FILE_BYTES) { setError(`${f.name} : trop volumineux (max 8 Mo).`); continue; }
      try {
        const dataBase64 = await fileToBase64(f);
        const previewUrl = f.type.startsWith("image/") ? URL.createObjectURL(f) : undefined;
        added.push({ name: f.name, mimeType: f.type || "application/octet-stream", dataBase64, previewUrl });
      } catch { /* ignore */ }
    }
    if (added.length) setAttachments((a) => [...a, ...added]);
  }

  function removeAttachment(i: number) {
    setAttachments((a) => {
      const copy = [...a];
      const [removed] = copy.splice(i, 1);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return copy;
    });
  }

  async function send(text: string) {
    const content = text.trim();
    if ((!content && attachments.length === 0) || loading) return;
    setError(null);

    const { data: { session: current } } = await supabase.auth.getSession();
    const userContent = content || (attachments.length ? "(voir pièces jointes)" : "");
    const next: Msg[] = [...messages, { role: "user", content: userContent }];
    setMessages(next);
    setInput("");
    const sentAttachments = attachments;
    setAttachments([]);
    setLoading(true);

    try {
      const payloadAttachments = sentAttachments.map((a) => ({
        name: a.name, mimeType: a.mimeType, dataBase64: a.dataBase64,
      }));
      const resp = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(current?.access_token ? { Authorization: `Bearer ${current.access_token}` } : {}),
        },
        body: JSON.stringify({
          messages: next.slice(-20).map(({ role, content }) => ({ role, content })),
          lang: chatLang,
          dialect,
          webSearch,
          attachments: payloadAttachments,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errJson = await resp.json().catch(() => ({ error: "Erreur" }));
        throw new Error(errJson.error || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistant = "";
      let sources: Source[] | undefined;
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
            if (Array.isArray(parsed.sources)) {
              sources = parsed.sources;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { ...copy[copy.length - 1], sources };
                return copy;
              });
              continue;
            }
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistant += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: assistant, sources };
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
    <div className="fixed inset-0 flex flex-col bg-background">
      {/* Header */}
      <header className="flex-none border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-2 px-3 sm:px-4">
          <PageNav />

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
              <span className="font-display text-base font-bold">F</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-sm font-semibold">FulanIA</span>
              <span className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                {t("chat.subtitle")}
              </span>
            </div>
          </div>
          <ChatLangSelector value={chatLang} onChange={setChatLang} dialect={dialect} onDialectChange={setDialect} label={t("chat.replyIn")} />
        </div>
      </header>

      {/* Messages — only scrollable area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-4xl px-3 py-6 sm:px-4 sm:py-8">
          <h1 className="sr-only">{t("chat.srTitle")}</h1>
          {messages.length === 0 ? (
            <div className="mx-auto max-w-2xl py-8 text-center sm:py-12">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="h-7 w-7" />
              </div>
              <h2 className="mt-6 font-display text-2xl font-semibold sm:text-3xl">{t("chat.hello")}</h2>
              <p className="mt-3 text-muted-foreground">{t("chat.intro")}</p>
              <div className="mt-8 grid gap-2.5 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-foreground transition hover:border-primary/50 hover:bg-primary/5">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((m, i) => (
                <MessageBubble key={i} role={m.role} content={m.content} sources={m.sources} />
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
      </div>

      {/* Composer */}
      <div className="flex-none border-t border-border bg-background">
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="mx-auto flex max-w-4xl items-end gap-2 px-3 py-3 sm:px-4 sm:py-4"
        >
          <textarea
            ref={textareaRef}
            id="chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
            rows={1}
            placeholder={t("chat.placeholder")}
            aria-label={t("chat.aria.msg")}
            className="min-h-[52px] max-h-[200px] flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3.5 text-base leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex h-[52px] w-[52px] flex-none items-center justify-center rounded-2xl bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("chat.send")}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}

function ChatLangSelector({
  value, onChange, dialect, onDialectChange, label,
}: {
  value: Lang;
  onChange: (l: Lang) => void;
  dialect: Dialect;
  onDialectChange: (d: Dialect) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGUAGES.find((l) => l.code === value) ?? LANGUAGES[0];
  const currentDialect = DIALECTS.find((d) => d.code === dialect) ?? DIALECTS[0];

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
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        title={label}
      >
        <Languages className="h-3.5 w-3.5" />
        <span>{current.code.toUpperCase()}{value === "ff" ? ` · ${currentDialect.code.split("_").map((s) => s[0].toUpperCase()).join("")}` : ""}</span>
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute end-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-lg">
          <div className="border-b border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            {label}
          </div>
          <ul role="listbox">
            {LANGUAGES.map((l) => (
              <li key={l.code}>
                <button
                  role="option"
                  aria-selected={l.code === value}
                  onClick={() => { onChange(l.code); if (l.code !== "ff") setOpen(false); }}
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
          <div className="border-t border-border px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            Pulaar — Dialecte
          </div>
          <ul role="listbox">
            {DIALECTS.map((d) => (
              <li key={d.code}>
                <button
                  role="option"
                  aria-selected={d.code === dialect}
                  onClick={() => { onDialectChange(d.code); setOpen(false); }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent"
                >
                  <span className="flex flex-col items-start leading-tight">
                    <span>{d.label}</span>
                    <span className="text-[10px] text-muted-foreground">{d.region}</span>
                  </span>
                  {d.code === dialect && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


function MessageBubble({ role, content }: Msg) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex max-w-[88%] gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
        <div className={`flex h-9 w-9 flex-none items-center justify-center rounded-full font-display text-sm font-bold ${isUser ? "bg-primary text-primary-foreground" : "bg-earth text-[var(--gold)]"}`}>
          {isUser ? "Vo" : "F"}
        </div>
        <div
          className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
            isUser
              ? "bg-primary text-primary-foreground whitespace-pre-wrap"
              : "border border-border bg-card text-foreground shadow-sm"
          }`}
        >
          {content ? (
            isUser ? content : (
              <div className="prose prose-base max-w-none text-foreground prose-p:my-2 prose-p:text-foreground prose-p:leading-relaxed prose-strong:text-earth prose-strong:font-semibold prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-li:text-foreground prose-headings:font-display prose-headings:text-earth prose-headings:mt-3 prose-headings:mb-1.5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:bg-muted prose-code:text-foreground prose-code:before:content-none prose-code:after:content-none">
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
