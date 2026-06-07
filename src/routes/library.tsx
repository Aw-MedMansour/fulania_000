import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import {
  BookMarked,
  Download,
  Loader2,
  Upload,
  Search,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/layout";
import { PageNav } from "@/components/page-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage, getCurrentLang, tFor } from "@/hooks/use-language";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { listBooks, getBookDownloadUrl, type BookListItem } from "@/lib/books.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/library")({
  head: () => {
    const l = getCurrentLang();
    return {
      meta: [
        { title: tFor(l, "seo./library.title") },
        { name: "description", content: tFor(l, "seo./library.desc") },
        { property: "og:title", content: tFor(l, "seo./library.title") },
        { property: "og:description", content: tFor(l, "seo./library.desc") },
        { property: "og:url", content: "https://fulania.com/library" },
      ],
    };
  },
  component: LibraryPage,
});

function fmtSize(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${kb.toFixed(0)} KB`;
}

function LibraryPage() {
  const { t } = useLanguage();
  const { isAdmin } = useIsAdmin();
  const fetchBooks = useServerFn(listBooks);
  const fetchDownload = useServerFn(getBookDownloadUrl);
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["library-books"],
    queryFn: () => fetchBooks(),
  });

  const books = data?.books ?? [];
  const filtered = q.trim()
    ? books.filter((b) => {
        const s = q.toLowerCase();
        return (
          b.title.toLowerCase().includes(s) ||
          b.author.toLowerCase().includes(s) ||
          (b.category ?? "").toLowerCase().includes(s) ||
          (b.dialect ?? "").toLowerCase().includes(s)
        );
      })
    : books;

  const onDownload = async (b: BookListItem) => {
    try {
      setDownloading(b.id);
      const { url } = await fetchDownload({ data: { id: b.id } });
      window.location.href = url;
      // optimistic counter
      qc.setQueryData(["library-books"], (prev: any) =>
        prev
          ? {
              ...prev,
              books: prev.books.map((x: BookListItem) =>
                x.id === b.id ? { ...x, download_count: x.download_count + 1 } : x,
              ),
            }
          : prev,
      );
    } catch (e) {
      console.error(e);
      alert(t("library.dlError"));
    } finally {
      setTimeout(() => setDownloading(null), 1200);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <PageNav className="mb-4" />

        <div className="mb-8 flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-earth text-[var(--gold)]">
            <BookMarked className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h1 className="font-display text-3xl font-semibold text-earth sm:text-4xl">
              {t("library.title")}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {t("library.subtitle")}
            </p>
          </div>
          {isAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-earth">
              <ShieldCheck className="h-3 w-3" /> Admin
            </span>
          )}
        </div>

        {isAdmin && (
          <AdminUpload onUploaded={() => qc.invalidateQueries({ queryKey: ["library-books"] })} />
        )}

        <div className="mb-5 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("library.search")}
              className="pl-9"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {filtered.length} {t("library.count")}
          </span>
        </div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg border border-border bg-muted/30" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
            {books.length === 0 ? t("library.empty") : t("library.noResults")}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((b) => (
              <article
                key={b.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40 hover:shadow-lg"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-earth/10 to-[var(--gold)]/10">
                  {b.cover_url ? (
                    <img
                      src={b.cover_url}
                      alt={b.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center">
                      <span className="font-display text-xl font-semibold text-earth">{b.title}</span>
                    </div>
                  )}
                  {b.dialect && (
                    <span className="absolute left-2 top-2 rounded-full bg-earth/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cream">
                      {b.dialect}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <h3 className="font-display text-lg font-semibold leading-tight text-earth line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {b.author}
                    {b.year ? ` · ${b.year}` : ""}
                  </p>
                  {b.description && (
                    <p className="line-clamp-3 text-xs text-foreground/70">{b.description}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <span className="text-[10px] text-muted-foreground">
                      ↓ {b.download_count} · {fmtSize(b.file_size_bytes)}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onDownload(b)}
                      disabled={downloading === b.id}
                      className={cn("gap-1.5", downloading === b.id && "opacity-70")}
                    >
                      {downloading === b.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      {t("library.download")}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

/* ------------------------------- ADMIN ------------------------------- */

const DIALECT_OPTS = ["fouta_toro", "fouta_djallon", "maasina", "aadamaawa"];
const LANG_OPTS = ["pulaar", "fr", "en", "ar"];

function AdminUpload({ onUploaded }: { onUploaded: () => void }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    author: "",
    description: "",
    language: "pulaar",
    dialect: "",
    category: "",
    year: "",
    isbn: "",
  });
  const [pdf, setPdf] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);

  const reset = () => {
    setForm({ title: "", author: "", description: "", language: "pulaar", dialect: "", category: "", year: "", isbn: "" });
    setPdf(null);
    setCover(null);
    setErr(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!form.title.trim() || !form.author.trim() || !pdf) {
      setErr(t("library.admin.required"));
      return;
    }
    if (pdf.type !== "application/pdf") {
      setErr(t("library.admin.pdfOnly"));
      return;
    }
    setBusy(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const stamp = Date.now();
      const safeTitle = form.title.toLowerCase().replace(/[^\w]+/g, "-").slice(0, 60);
      const pdfPath = `${stamp}-${safeTitle}.pdf`;

      const { error: pdfErr } = await supabase.storage
        .from("books-pdfs")
        .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: false });
      if (pdfErr) throw pdfErr;

      let coverPath: string | null = null;
      if (cover) {
        const ext = cover.name.split(".").pop()?.toLowerCase() || "jpg";
        coverPath = `${stamp}-${safeTitle}.${ext}`;
        const { error: cErr } = await supabase.storage
          .from("books-covers")
          .upload(coverPath, cover, { contentType: cover.type, upsert: false });
        if (cErr) throw cErr;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const { error: insErr } = await supabase.from("books").insert({
        title: form.title.trim(),
        author: form.author.trim(),
        description: form.description.trim() || null,
        language: form.language || null,
        dialect: form.dialect || null,
        category: form.category.trim() || null,
        year: form.year ? Number(form.year) : null,
        isbn: form.isbn.trim() || null,
        pdf_path: pdfPath,
        pdf_url: pdfPath,
        cover_path: coverPath,
        cover_url: coverPath,
        file_size_bytes: pdf.size,
        created_by: user?.id ?? null,
      });
      if (insErr) throw insErr;

      reset();
      setOpen(false);
      onUploaded();
    } catch (e: any) {
      setErr(e?.message ?? "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-[var(--gold)]/40 bg-gradient-to-br from-[var(--gold)]/5 to-[var(--terracotta)]/5 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-earth" />
          <p className="text-sm font-semibold text-earth">{t("library.admin.title")}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen((v) => !v)}>
          {open ? t("library.admin.close") : t("library.admin.add")}
        </Button>
      </div>

      {open && (
        <form onSubmit={submit} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fTitle")} *</span>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fAuthor")} *</span>
            <Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} required />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fDesc")}</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fLang")}</span>
            <select
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {LANG_OPTS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fDialect")}</span>
            <select
              value={form.dialect}
              onChange={(e) => setForm({ ...form, dialect: e.target.value })}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">—</option>
              {DIALECT_OPTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fCat")}</span>
            <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fYear")}</span>
            <Input type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </label>
          <label className="sm:col-span-2 flex flex-col gap-1 text-xs">
            <span className="font-medium">ISBN</span>
            <Input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fPdf")} *</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
              required
              className="text-xs"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="font-medium">{t("library.admin.fCover")}</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setCover(e.target.files?.[0] ?? null)}
              className="text-xs"
            />
          </label>
          {err && <p className="sm:col-span-2 text-xs text-destructive">{err}</p>}
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={reset} disabled={busy}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> {t("library.admin.reset")}
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {t("library.admin.uploading")}</> : <><Upload className="mr-1.5 h-4 w-4" /> {t("library.admin.publish")}</>}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
