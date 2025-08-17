// lib/groq.ts
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

export async function generateSummary({
  transcript,
  prompt,
}: { transcript: string; prompt: string }) {
  const sys = `You summarize meeting transcripts. Return:
- Title
- Executive bullets
- Decisions
- Action Items (array with: title, owner, due if mentioned)
- Risks/Blockers
Format clearly. Be concise.`;

  const user = `Transcript:\n${transcript}\n\nInstruction:\n${prompt}`;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
    temperature: 0.2,
  });

  return res.choices[0]?.message?.content ?? "";
}
