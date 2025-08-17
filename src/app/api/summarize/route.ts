// app/api/summarize/route.ts
import { db } from "@/lib/db";
import { Transcript, SummaryVersion } from "@/lib/models";
import { generateSummary } from "@/lib/groq";

export async function POST(req: Request) {
  await db();
  const { transcriptId, prompt } = await req.json();

  const t = await Transcript.findById(transcriptId);
  if (!t) return new Response("Not found", { status: 404 });

  const content = await generateSummary({ transcript: t.text, prompt: prompt ?? "" });

  // naive action-item extraction (JSON fallback)
  const actionItems = Array.from(content.matchAll(/- \[AI\]\s*(.*?)(?:\s+\(owner:\s*(.*?)\))?(?:\s+\(due:\s*(.*?)\))?/gi))
    .map(m => ({ title: m[1]?.trim() ?? "", owner: m[2]?.trim() ?? "", due: m[3]?.trim() ?? "" }));

  const s = await SummaryVersion.create({
    transcriptId,
    prompt: prompt ?? "",
    content,
    actionItems,
  });

  return Response.json({ summaryId: s._id.toString(), content, actionItems });
}
