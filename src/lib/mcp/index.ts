import { auth, defineMcp } from "@lovable.dev/mcp-js";
import translateTool from "./tools/translate";
import cultureQaTool from "./tools/culture-qa";
import dictionaryLookupTool from "./tools/dictionary-lookup";
import grammarExplainTool from "./tools/grammar-explain";
import vocabularyLessonTool from "./tools/vocabulary-lesson";
import generateExerciseTool from "./tools/generate-exercise";
import textCorrectionTool from "./tools/text-correction";
import chatWithJanngudeTool from "./tools/chat-with-janngude";
import searchResourcesTool from "./tools/search-resources";

export default defineMcp({
  name: "fulania",
  title: "Fulania",
  version: "0.1.0",
  instructions:
    "FulanIA tools for Pulaar / Fulfulde / Pular and Fulɓe culture: translation, dictionary, grammar, vocabulary, exercises, text correction, culture Q&A, resource search, and Janngude conversation. OAuth authorization with a FulanIA account is required. These tools do not expose stored profiles, progress, conversations, favorites or donations.",
  auth: auth.oauth.issuer({
    issuer: `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset"}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
    requireOAuthClientClaim: true,
  }),
  tools: [
    translateTool,
    dictionaryLookupTool,
    grammarExplainTool,
    vocabularyLessonTool,
    generateExerciseTool,
    textCorrectionTool,
    cultureQaTool,
    chatWithJanngudeTool,
    searchResourcesTool,
  ],
});
