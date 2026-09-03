"use client";

import { useState } from "react";
import { summarizeNoteAction } from "@/lib/notes/ai-actions";
import { Sparkles, Loader2, BookOpen, CheckCircle2, Tag } from "lucide-react";

interface AISummaryData {
  summary?: string;
  keyLessons?: string[];
  themes?: string[];
}

export default function SummaryCard({
  noteId,
  initialSummary,
}: {
  noteId: string;
  initialSummary?: AISummaryData | null;
}) {
  const [summaryData, setSummaryData] = useState<AISummaryData | null>(initialSummary || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await summarizeNoteAction(noteId);
      setSummaryData(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate AI summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parchment-card p-8 bg-gradient-to-br from-[#C59B27]/5 via-[#FDFBF7] to-[#7A2E2E]/5 border-[#C59B27]/30 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C59B27] to-[#B8941F] flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1A1815]">AI Reflection & Summary</h3>
            <p className="text-xs font-semibold text-[#665C52]">Powered by Gemini 3.1 Flash Lite</p>
          </div>
        </div>

        {!summaryData && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary py-2.5 px-5 text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Summarizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Summary</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {summaryData && (
        <div className="space-y-6 pt-2">
          {summaryData.summary && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#665C52] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-[#C59B27]" /> Executive Summary
              </h4>
              <p className="font-serif text-base text-[#1A1815] leading-relaxed italic bg-white/60 p-4 rounded-xl border border-[--border-subtle]">
                "{summaryData.summary}"
              </p>
            </div>
          )}

          {summaryData.keyLessons && summaryData.keyLessons.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#665C52] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#5B7566]" /> Key Spiritual Lessons
              </h4>
              <ul className="space-y-2">
                {summaryData.keyLessons.map((lesson, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#1A1815] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C59B27] mt-2 shrink-0" />
                    <span>{lesson}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summaryData.themes && summaryData.themes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[--border-subtle]">
              <span className="text-xs font-semibold text-[#665C52] flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Extracted Themes:
              </span>
              {summaryData.themes.map((theme, i) => (
                <span key={i} className="badge-gold text-[11px]">
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
