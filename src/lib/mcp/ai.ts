// Minimal Lovable AI Gateway helper for MCP tools (public, no auth).
// Reads LOVABLE_API_KEY at call time from the request env, never at module scope.

export type ChatMsg = { role: "system" | "user" | "assistant"; content: string };

export async function callAI(
  messages: ChatMsg[],
  opts: { model?: string; temperature?: number } = {},
): Promise<string> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "raw-fetch",
    },
    body: JSON.stringify({
      model: opts.model ?? "google/gemini-3.8-flash",
      messages,
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
    }),
  });

  if (res.status === 429) throw new Error("Rate limited — please try again shortly.");
  if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`AI gateway error ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

export function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

export function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}
