import { defineMcp } from "@lovable.dev/mcp-js";
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
  name: "fulania-mcp",
  title: "FulanIA — Pulaar & Fulɓe culture",
  version: "0.1.0",
  instructions:
    "FulanIA's public MCP server. Tools for the Pulaar / Fulfulde / Pular language and Fulɓe (Fulani/Peul) culture: translation between Pulaar / French / English / Arabic, dictionary lookup, grammar explanations, vocabulary lessons, exercises, text correction, culture Q&A, resource search, and chat with the Janngude tutor. All tools are public and read-only; per-user features (profile, progress) are available in the FulanIA web app.",
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
