import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BookListItem = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  cover_url: string | null;
  language: string | null;
  dialect: string | null;
  category: string | null;
  year: number | null;
  isbn: string | null;
  pages: number | null;
  file_size_bytes: number | null;
  download_count: number;
  created_at: string;
};

export const listBooks = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin
    .from("books")
    .select("id,title,author,description,cover_path,language,dialect,category,year,isbn,pages,file_size_bytes,download_count,created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const items: BookListItem[] = await Promise.all(
    rows.map(async (b) => {
      let cover_url: string | null = null;
      if (b.cover_path) {
        const { data: s } = await supabaseAdmin.storage
          .from("books-covers")
          .createSignedUrl(b.cover_path, 60 * 60 * 24 * 7);
        cover_url = s?.signedUrl ?? null;
      }
      return {
        id: b.id,
        title: b.title,
        author: b.author,
        description: b.description,
        cover_url,
        language: b.language,
        dialect: b.dialect,
        category: b.category,
        year: b.year,
        isbn: b.isbn,
        pages: b.pages,
        file_size_bytes: b.file_size_bytes,
        download_count: b.download_count,
        created_at: b.created_at,
      };
    }),
  );

  return { books: items };
});

const downloadInput = z.object({ id: z.string().uuid() });

export const getBookDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => downloadInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: book, error } = await supabaseAdmin
      .from("books")
      .select("pdf_path,title")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!book) throw new Error("Book not found");

    const filename = `${book.title.replace(/[^\w\-. ]/g, "_").slice(0, 80)}.pdf`;

    const { data: signed, error: sErr } = await supabaseAdmin.storage
      .from("books-pdfs")
      .createSignedUrl(book.pdf_path, 60 * 10, { download: filename });
    if (sErr || !signed) throw new Error(sErr?.message ?? "sign-failed");

    // best-effort count bump
    await supabaseAdmin.rpc("increment_book_downloads", { _book_id: data.id });

    return { url: signed.signedUrl };
  });
