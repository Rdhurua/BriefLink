"use client";
import { useState } from "react";

interface Summary {
  id: string;
  content: string;
  prompt: string;
}

export default function Features() {
  const [transcriptId, setTranscriptId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [emails, setEmails] = useState("");
  const [pii, setPii] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  const [useFile, setUseFile] = useState(false);
  const [useText, setUseText] = useState(false);

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  const [selectedSummaryId, setSelectedSummaryId] = useState<string>("");

  // Reset for new transcript
  const resetTranscript = () => {
    setTranscriptId("");
    setSummaries([]);
    setPrompt("");
    setSelectedSummaryId("");
    setUseFile(false);
    setUseText(false);
    setPublicUrl("");
    setEmails("");
    setPii(false);
    setFileName("No file chosen");
  };

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const text = fd.get("text")?.toString().trim();
    const file = fd.get("file") as File;

    let res;
    if (file && file.size > 0) {
      res = await fetch("/api/upload", { method: "POST", body: fd });
    } else if (text && text.length > 0) {
      res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
    } else {
      alert("Please upload a file or paste text");
      return;
    }

    const j = await res.json();
    setTranscriptId(j.transcriptId); // This hides upload and shows prompt automatically
  }

  let [loading, setLoading] = useState(false);

  async function onSummarize() {
    if (!transcriptId || !prompt.trim()) return;

    setLoading(true); // start loader
    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptId, prompt }),
      });

      const j = await res.json();

      const newSummary: Summary = {
        id: j.summaryId,
        content: j.content,
        prompt,
      };

      setSummaries([...summaries, newSummary]);
      setSelectedSummaryId(j.summaryId);
      setPrompt("");
    } catch (error) {
      console.error("Error summarizing:", error);
    } finally {
      setLoading(false); // stop loader
    }
  }

  async function onSave(summary: Summary) {
    await fetch(`/api/summary/${summary.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: summary.content, summaryId: summary.id }),
    });
    alert("Saved");
  }

  async function onCreateLink() {
    const summary = summaries.find((s) => s.id === selectedSummaryId);
    if (!summary) return;

    const res = await fetch("/api/share/link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ summaryId: summary.id, ttlMinutes: 120 }),
    });
    const j = await res.json();
    setPublicUrl(j.url);
    setShowLinkModal(true);
  }
  const [fileName, setFileName] = useState("No file chosen");

  const onShareEmail=async()=>{
     console.log("sharing the email..");
  }
  return (
    <>
    <main className="max-w-7xl mx-auto px-4 md:px-6 py-10 h-auto">
  <div className="p-6 sm:p-8 flex flex-col lg:flex-row gap-6 justify-between w-full">
    {/* Left Column: Upload OR Prompt */}
    <div className="w-full lg:w-1/3 space-y-6">
      {!transcriptId ? (
        <div className="bg-white shadow-lg shadow-gray-700 rounded-xl p-6 border border-gray-200 w-full">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 text-center">
            Upload or Paste Transcript
          </h2>

          <form onSubmit={onUpload} className="space-y-4">
            {/* File Input */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 border-2 border-gray-300 p-3 rounded-lg">
              <label
                htmlFor="file"
                className={`px-4 py-2 rounded-lg text-white cursor-pointer transition ${
                  useText
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Choose File
              </label>

              <input
                id="file"
                name="file"
                type="file"
                accept=".txt"
                disabled={useText}
                onChange={(e) => {
                  if (e.target.files?.length) {
                    setUseFile(true);
                    setUseText(false);
                    setFileName(e.target.files[0].name);
                  } else {
                    setUseFile(false);
                    setFileName("No file chosen");
                  }
                }}
                className="hidden"
              />

              <span className="text-xs sm:text-sm text-gray-500 break-words">
                {fileName ?? "No file chosen"}
              </span>
            </div>

            {/* OR Divider */}
            <div className="flex items-center justify-center">
              <p className="text-sm sm:text-base text-gray-700 font-semibold">
                OR
              </p>
            </div>

            {/* Textarea */}
            <textarea
              name="text"
              rows={5}
              placeholder="...or paste transcript here"
              disabled={useFile}
              onChange={(e) => {
                if (e.target.value.trim()) {
                  setUseText(true);
                  setUseFile(false);
                  setFileName("No file chosen"); // reset file if typing
                } else {
                  setUseText(false);
                }
              }}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm sm:text-base resize-none sm:resize-y"
            />

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-black text-base sm:text-lg text-white py-2 px-4 rounded-lg font-bold transition"
            >
              Go
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4 w-full">
          {/* Success Alert */}
          <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-center shadow-sm animate-fade-in text-sm sm:text-base">
            ✅ Successfully Uploaded!
          </div>

          {/* Small Uploaded Box */}
          <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 text-center text-sm sm:text-base">
            <p className="text-gray-700">Transcript is ready for summarization.</p>
          </div>

          {/* Prompt Input + Summarize Button */}
          <div className="bg-yellow-50 shadow-md rounded-xl p-6 border-l-4 border-yellow-400 flex flex-col justify-center">
            <label className="block font-semibold mb-2 text-gray-700 text-center text-sm sm:text-base">
              Instruction / Prompt
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-gray-900 text-sm sm:text-base"
              placeholder="Summarize in bullet points for executives..."
            />

            <button
              onClick={onSummarize}
              className="mt-4 w-full bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition text-sm sm:text-base"
            >
              {loading ? "Summarizing.." : "Generate Summary"}
            </button>
          </div>
        </div>
      )}
    </div>

    {/* Right Column: Summary Area */}
    <div className="w-full lg:w-2/3">
      {summaries.length > 0 && (
        <div className="flex flex-col gap-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-start">
            <button
              onClick={resetTranscript}
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition text-sm sm:text-base"
            >
              New Transcript
            </button>
            <button
              onClick={() => setShowEmailModal(true)}
              className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
            >
              Share via Email
            </button>
            <button
              onClick={onCreateLink}
              className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition text-sm sm:text-base"
            >
              Generate Link
            </button>
          </div>

          {/* Editable Summary */}
          {selectedSummaryId && (
            <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 border border-gray-200 h-[300px] sm:h-[400px] overflow-y-auto">
              <label className="block font-semibold mb-2 text-gray-700 text-sm sm:text-base">
                Editable Summary
              </label>
              <textarea
                value={
                  summaries.find((s) => s.id === selectedSummaryId)?.content || ""
                }
                onChange={(e) => {
                  setSummaries((prev) =>
                    prev.map((s) =>
                      s.id === selectedSummaryId
                        ? { ...s, content: e.target.value }
                        : s
                    )
                  );
                }}
                rows={10}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm sm:text-base"
              />
              <button
                onClick={() =>
                  onSave(summaries.find((s) => s.id === selectedSummaryId)!)
                }
                className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition text-sm sm:text-base"
              >
                Save Edits
              </button>
            </div>
          )}

          {/* Prompt Commands List */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm sm:text-base">
            <h3 className="font-semibold text-gray-800 mb-2">Prompts Used</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {summaries.map((s) => (
                <li key={s.id}>{s.prompt}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>

    {/* Email Modal */}
    {showEmailModal && (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
        <div className="bg-white rounded-lg p-6 w-11/12 sm:w-[28rem] shadow-lg relative">
          <button
            onClick={() => setShowEmailModal(false)}
            className="absolute top-2 right-2 text-gray-900 hover:text-gray-800 cursor-pointer"
          >
            ✕
          </button>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Share Summary via Email</h2>
          <input
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Recipients (comma-separated)"
            className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-900 text-sm sm:text-base"
          />
          <div className="flex items-center gap-2 mb-4 text-gray-900 text-sm sm:text-base">
            <input
              type="checkbox"
              checked={pii}
              onChange={(e) => setPii(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Redact PII before sending</span>
          </div>
          <button
            onClick={async () => {
              await onShareEmail();
              setShowEmailModal(false);
            }}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition text-sm sm:text-base"
          >
            Send
          </button>
        </div>
      </div>
    )}

    {/* Link Modal */}
    {showLinkModal && (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">
        <div className="bg-white rounded-lg p-6 w-11/12 sm:w-[28rem] shadow-lg relative">
          <button
            onClick={() => setShowLinkModal(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Public Link</h2>
          <div className="flex gap-2 mb-4">
            <input
              value={publicUrl}
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg text-gray-900 text-sm sm:text-base"
            />
            <button
              onClick={() => navigator.clipboard.writeText(publicUrl)}
              className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition text-sm sm:text-base"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
</main>

    
    </>
  );
}
