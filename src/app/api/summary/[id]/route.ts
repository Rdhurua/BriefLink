// app/api/summary/[id]/route.ts
import { db } from "@/lib/db";
import { SummaryVersion } from "@/lib/models";

export async function PATCH(req: Request) {
  await db();

  const body = await req.json();
  const { content, summaryId } = body;
  console.log(summaryId);

  const s = await SummaryVersion.findByIdAndUpdate(
    summaryId,
    { ...(content && { content }) },
    { new: true }
  );

  if (!s) return new Response("Not found", { status: 404 });
  return Response.json(s); // return updated doc directly
}
