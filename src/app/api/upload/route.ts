import { db } from "@/lib/db";
import { Transcript } from "@/lib/models";

export async function POST(req: Request) {
  await db();

  try {
    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // Handle JSON text input
      const { text } = await req.json();
      if (text && text.trim().length > 0) {
        const doc = await Transcript.create({ text });
        return Response.json({ transcriptId: doc._id });
      }
    } 
    else if (contentType.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      if (file && file.size > 0) {
        const content = await file.text();
        const doc = await Transcript.create({ text: content });
        return Response.json({ transcriptId: doc._id });
      }
    }

    return new Response("No valid transcript provided", { status: 400 });
  } catch (error) {
    console.error("Error during uploading:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
