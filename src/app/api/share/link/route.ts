// app/api/share/link/route.ts
import { db } from "@/lib/db";
import { Share } from "@/lib/models";
import { nano } from "@/lib/ids";

export async function POST(req: Request) {
  await db();
  const { summaryId, ttlMinutes = 60 } = await req.json();
  const token = nano();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
  const share = await Share.create({ summaryId, token, expiresAt });
  return Response.json({ url: `${process.env.NEXT_PUBLIC_APP_URL}/s/${token}` });
}
