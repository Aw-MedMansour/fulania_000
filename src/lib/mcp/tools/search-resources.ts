import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callAI, textResult, errorResult } from "../ai";

export default defineTool({
  name: "search_resources",
  title: "Search FulanIA public resources",
  description:
    "Search FulanIA's public educational resources — articles, culture pages, learning modules, and dictionary highlights — and return a brief summary with pointers.",
  inputSchema: {
    query: z.string().min(2).max(200).describe("What you are looking for."),
    language: z.enum(["french", "english", "arabic"]).default("french"),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: true },
  handler: async ({ query, language }) => {
    try {
      const out = await callAI([
        {
          role: "system",
          content: `You are FulanIA's librarian. FulanIA (https://fulania.com) publishes public content about the Pulaar / Fulfulde language and Fulɓe culture — sections include /hub (overview), /learn (lessons), /culture (traditions), /dictionary (word bank), /library (books), /translate (translator), /chat (Janngude tutor). Given the user's query, answer in ${language}: 2–4 sentences summarising what FulanIA offers on that topic, then list the most relevant section paths as Markdown links (e.g. [Culture](https://fulania.com/culture)). Do not fabricate URLs outside those sections.`,
        },
        { role: "user", content: query },
      ]);
      return textResult(out);
    } catch (e) {
      return errorResult(e instanceof Error ? e.message : "Failed");
    }
  },
});
