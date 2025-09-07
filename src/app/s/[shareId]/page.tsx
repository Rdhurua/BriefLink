// app/s/[shareId]/page.tsx
import { db } from "@/lib/db";
import { Share, SummaryVersion } from "@/lib/models";
import type { Metadata} from "next";


type PageProps = {
  params: Promise<{ shareId: string }>;
};

export default async function SharePage({ params }: PageProps) {
  const { shareId } = await params; 

  await db();

  const share = await Share.findOne({ token: shareId });
  if (!share)
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-red-600 text-lg font-semibold">Invalid link</p>
      </main>
    );

  if (share.expiresAt < new Date())
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-yellow-600 text-lg font-semibold">Link expired</p>
      </main>
    );

  const s = await SummaryVersion.findById(share.summaryId);
  if (!s)
    return (
      <main className="flex items-center justify-center h-screen">
        <p className="text-gray-600 text-lg font-semibold">Summary missing</p>
      </main>
    );

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600 mb-4">Shared Summary</h1>
        <div className="prose prose-indigo">
          <pre className="whitespace-pre-wrap text-gray-900">{s.content}</pre>
        </div>
        <div className="mt-6 flex justify-end">
          <p className="text-sm text-gray-800">
            Expires: {share.expiresAt.toLocaleString()}
          </p>
        </div>
      </div>
    </main>
  );
}

// ✅ Optional SEO metadata
export async function generateMetadata(
  { params }: PageProps,
  // _parent: ResolvingMetadata
): Promise<Metadata> {
  const { shareId } = await params;
  return {
    title: `Shared Summary - ${shareId}`,
    description: "View the shared summary",
  };
}
