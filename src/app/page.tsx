"use client";

import { useState } from "react";

interface Summary {
  id: string;
  content: string;
  prompt: string;
}

export default function Home() {
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
    setTranscriptId(j.transcriptId);
  }

  async function onSummarize() {
    if (!transcriptId || !prompt.trim()) return;

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
  }

  async function onSave(summary: Summary) {
    await fetch(`/api/summary/${summary.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: summary.content, summaryId: summary.id }),
    });
    alert("Saved");
  }

  async function onShareEmail() {
    const summary = summaries.find((s) => s.id === selectedSummaryId);
    if (!summary) return;

    const response = await fetch("/api/share/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        summaryId: summary.id,
        to: emails
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        pii,
      }),
    });
    if (response.ok) {
      alert("Email sent");
    }
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

  return (
    <main className="max-w-6xl mx-auto px-6 py-10 h-auto">
      <h1 className="text-4xl font-extrabold text-center text-indigo-600 mb-8">
        BriefLink
      </h1>

      <div className="flex flex-col lg:flex-row gap-6 relative">
        {/* Left Column: Upload + Prompt */}
        <div className="lg:w-1/2 space-y-6">
          <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Upload or Paste Transcript
            </h2>
            <form onSubmit={onUpload} className="space-y-4">
              <input
                name="file"
                type="file"
                accept=".txt"
                disabled={useText}
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setUseFile(true);
                    setUseText(false);
                  } else {
                    setUseFile(false);
                  }
                }}
                className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer p-2 focus:ring-2 focus:ring-indigo-500"
              />
              {useFile && (
                <div className="text-green-700 text-sm font-medium mt-1">
                  File uploaded ✅
                </div>
              )}
              <textarea
                name="text"
                rows={5}
                placeholder="...or paste transcript here"
                disabled={useFile}
                onChange={(e) => {
                  if (e.target.value.trim().length > 0) {
                    setUseText(true);
                    setUseFile(false);
                  } else {
                    setUseText(false);
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
              />
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Save Transcript
              </button>
            </form>
          </div>

          {/* Prompt input for iterative summaries */}
          {transcriptId && (
            <div className="bg-yellow-50 shadow-md rounded-xl p-6 border-l-4 border-yellow-400 sticky top-4">
              <label className="block font-semibold mb-2 text-gray-700">
                Instruction / Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:outline-none text-gray-900"
                placeholder="Summarize in bullet points for executives..."
              />
              <button
                onClick={onSummarize}
                className="mt-4 w-full bg-yellow-500 text-black py-2 px-4 rounded-lg font-semibold hover:bg-yellow-600 transition"
              >
                Generate Summary
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Summary + Sharing */}
        {summaries.length > 0 && (
          <div className="lg:w-2/3 flex flex-col gap-6 relative">
            {/* Top-right Buttons */}
            <div className="flex justify-end gap-3 sticky top-0 z-20 p-4 bg-white">
              <button
                onClick={resetTranscript}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition"
              >
                New Transcript
              </button>
              <button
                onClick={() => setShowEmailModal(true)}
                className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
              >
                Share via Email
              </button>
              <button
                onClick={onCreateLink}
                className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition"
              >
                Generate Link
              </button>
            </div>

            {/* Summary history tabs */}
            <div className="flex gap-2 overflow-x-auto py-2">
              {summaries.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSummaryId(s.id)}
                  className={`px-4 py-2 rounded-lg border ${
                    selectedSummaryId === s.id
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {s.prompt.slice(0, 20)}...
                </button>
              ))}
            </div>

            {/* Editable Summary */}
            {selectedSummaryId && (
              <div className="bg-white shadow-md rounded-xl p-6 border border-gray-200 h-[500px] overflow-y-auto">
                <label className="block font-semibold mb-2 text-gray-700">
                  Editable Summary
                </label>
                <textarea
                  value={
                    summaries.find((s) => s.id === selectedSummaryId)?.content ||
                    ""
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
                  rows={12}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900"
                />
                <button
                  onClick={() =>
                    onSave(
                      summaries.find((s) => s.id === selectedSummaryId)!
                    )
                  }
                  className="mt-4 w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Save Edits
                </button>
              </div>
            )}
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
              <button
                onClick={() => setShowEmailModal(false)}
                className="absolute top-2 right-2 text-gray-900 hover:text-gray-800 cursor-pointer"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Share Summary via Email
              </h2>
              <input
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                placeholder="Recipients (comma-separated)"
                className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-gray-900"
              />
              <div className="flex items-center gap-2 mb-4 text-gray-900">
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
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* Link Modal */}
        {showLinkModal && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg relative">
              <button
                onClick={() => setShowLinkModal(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Public Link
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  value={publicUrl}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-900"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(publicUrl)}
                  className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 transition"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
