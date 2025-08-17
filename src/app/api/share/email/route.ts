// app/api/share/email/route.ts
import { db } from "@/lib/db";
import { buildICS } from "@/lib/ics";
import { SummaryVersion, EmailLog } from "@/lib/models";
import { redactPII } from "@/lib/pii";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  await db();
  const { summaryId, to, pii = false } = await req.json();

  // Fetch summary
  const s = await SummaryVersion.findById(summaryId);
  if (!s) return new Response("Not found", { status: 404 });

  let body = s.content as string;
  if (pii) body = redactPII(body);

  // Build ICS file
  const ics = buildICS(s.actionItems ?? []);
  const icsBase64 = Buffer.from(ics, "utf-8").toString("base64");

  // Send email
  const response = await resend.emails.send({
    from: "onboarding@resend.dev", // must be verified domain for external
    to,
    subject: "Meeting Summary",
    text: body,
    attachments: [
      {
        filename: "action-items.ics",
        content: icsBase64,
        contentType: "text/calendar",
      },
    ],
  });

  console.log("Resend response:", response);

  // Save log
  await EmailLog.create({
    to,
    summaryId,
    piiRedacted: pii,
    sentAt: new Date(),
  });

  return Response.json({ ok: true, response });
}
