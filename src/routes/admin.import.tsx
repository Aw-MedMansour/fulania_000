import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { importDictionaryEntries } from "@/lib/dictionary-import.functions";

export const Route = createFileRoute("/admin/import")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
  },
  component: ImportPage,
});

type Row = {
  pulaar: string;
  french: string;
  arabic?: string;
  english?: string;
  category?: string;
  pronunciation?: string;
  example_pulaar?: string;
  example_french?: string;
};

const FIELDS = [
  "pulaar",
  "french",
  "arabic",
  "english",
  "category",
  "pronunciation",
  "example_pulaar",
  "example_french",
] as const;

function parseCSV(text: string): Row[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const delim = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === delim) { out.push(cur); cur = ""; }
        else cur += c;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, "_"));
  const rows: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => { obj[h] = cells[idx] ?? ""; });
    if (!obj.pulaar || !obj.french) continue;
    const row: Row = { pulaar: obj.pulaar, french: obj.french };
    for (const f of FIELDS) {
      if (f === "pulaar" || f === "french") continue;
      if (obj[f]) (row as Record<string, string>)[f] = obj[f];
    }
    rows.push(row);
  }
  return rows;
}

function parseJSON(text: string): Row[] {
  const data = JSON.parse(text);
  const arr = Array.isArray(data) ? data : Array.isArray(data?.entries) ? data.entries : [];
  return arr
    .filter((e: Row) => e && typeof e.pulaar === "string" && typeof e.french === "string")
    .map((e: Row) => {
      const r: Row = { pulaar: e.pulaar.trim(), french: e.french.trim() };
      for (const f of FIELDS) {
        if (f === "pulaar" || f === "french") continue;
        const v = (e as Record<string, unknown>)[f];
        if (typeof v === "string" && v.trim()) (r as Record<string, string>)[f] = v.trim();
      }
      return r;
    });
}

function ImportPage() {
  const importFn = useServerFn(importDictionaryEntries);
  const [text, setText] = useState("");
  const [filename, setFilename] = useState<string | null>(null);
  const [preview, setPreview] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number } | null>(null);

  const handleParse = (raw: string) => {
    setError(null); setResult(null);
    try {
      const trimmed = raw.trim();
      if (!trimmed) { setPreview([]); return; }
      const rows = trimmed.startsWith("[") || trimmed.startsWith("{")
        ? parseJSON(trimmed)
        : parseCSV(trimmed);
      if (rows.length === 0) {
        setError("Aucune ligne valide. Vérifie que les colonnes pulaar et french existent.");
      }
      setPreview(rows);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Format invalide");
      setPreview([]);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFilename(file.name);
    const raw = await file.text();
    setText(raw);
    handleParse(raw);
  };

  const onImport = async () => {
    if (preview.length === 0) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const res = await importFn({ data: { entries: preview } });
      setResult(res);
      setText(""); setPreview([]); setFilename(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur d'import");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-semibold text-earth sm:text-4xl">
            Import du dictionnaire
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Importe en masse des mots Pulaar avec leurs traductions. Format CSV ou JSON.
          </p>
          <Link to="/dictionary" className="mt-1 inline-block text-xs text-primary hover:underline">
            ← Retour au dictionnaire
          </Link>
        </div>

        <section className="rounded-lg border border-border/60 bg-card p-5">
          <h2 className="font-display text-lg font-semibold text-earth">Format attendu</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Colonnes obligatoires : <code className="rounded bg-muted px-1">pulaar</code>,{" "}
            <code className="rounded bg-muted px-1">french</code>. Optionnelles :{" "}
            <code className="rounded bg-muted px-1">arabic</code>,{" "}
            <code className="rounded bg-muted px-1">english</code>,{" "}
            <code className="rounded bg-muted px-1">category</code>,{" "}
            <code className="rounded bg-muted px-1">pronunciation</code>,{" "}
            <code className="rounded bg-muted px-1">example_pulaar</code>,{" "}
            <code className="rounded bg-muted px-1">example_french</code>.
          </p>
          <pre className="mt-3 overflow-x-auto rounded bg-earth/95 p-3 text-xs text-cream">
{`pulaar,french,arabic,english,category
jam,paix,سلام,peace,salutations
ndiyam,eau,ماء,water,nature
neɗɗo,personne,شخص,person,famille`}
          </pre>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 text-center hover:bg-accent/30">
            <Upload className="h-8 w-8 text-primary" />
            <span className="mt-2 text-sm font-medium text-earth">Uploader un fichier</span>
            <span className="text-xs text-muted-foreground">.csv ou .json</span>
            {filename && <span className="mt-2 text-xs text-primary">{filename}</span>}
            <input type="file" accept=".csv,.json,text/csv,application/json" className="hidden" onChange={onFile} />
          </label>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-earth">
              <FileText className="h-4 w-4" /> Ou colle ton contenu
            </div>
            <textarea
              value={text}
              onChange={(e) => { setText(e.target.value); handleParse(e.target.value); }}
              placeholder="Colle CSV ou JSON ici…"
              className="mt-2 h-32 w-full resize-none rounded border border-input bg-background p-2 font-mono text-xs"
            />
          </div>
        </section>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {result && (
          <div className="mt-4 flex items-start gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            {result.inserted} entrée(s) importée(s) avec succès dans le dictionnaire.
          </div>
        )}

        {preview.length > 0 && (
          <section className="mt-6 rounded-lg border border-border/60 bg-card">
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
              <h3 className="font-display text-base font-semibold text-earth">
                Aperçu — {preview.length} ligne(s)
              </h3>
              <button
                onClick={onImport}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Import en cours…" : `Importer ${preview.length} mots`}
              </button>
            </div>
            <div className="max-h-96 overflow-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted/80 text-left">
                  <tr>
                    <th className="px-3 py-2">Pulaar</th>
                    <th className="px-3 py-2">Français</th>
                    <th className="px-3 py-2">Arabe</th>
                    <th className="px-3 py-2">English</th>
                    <th className="px-3 py-2">Catégorie</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 100).map((r, i) => (
                    <tr key={i} className="border-t border-border/40">
                      <td className="px-3 py-1.5 font-medium text-earth">{r.pulaar}</td>
                      <td className="px-3 py-1.5">{r.french}</td>
                      <td className="px-3 py-1.5" dir="rtl">{r.arabic ?? ""}</td>
                      <td className="px-3 py-1.5">{r.english ?? ""}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.category ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 100 && (
                <p className="border-t border-border/40 px-3 py-2 text-center text-xs text-muted-foreground">
                  … {preview.length - 100} ligne(s) supplémentaires non affichées
                </p>
              )}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
