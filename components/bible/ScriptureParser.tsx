"use client";

import { useState } from "react";
import { BookOpen, X, Loader2 } from "lucide-react";

const TRANSLATIONS = [
  { id: "de4e12af7f28f599-02", name: "KJV" },
  { id: "06125adad2d5898a-01", name: "ASV" },
];

export default function ScriptureParser({ content }: { content: string }) {
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<string>("de4e12af7f28f599-02");
  const [verseData, setVerseData] = useState<{ text: string; translation: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchVerse = async (ref: string, translation: string = selectedTranslation) => {
    setActiveRef(ref);
    setLoading(true);
    try {
      const res = await fetch(`/api/bible/verse?ref=${encodeURIComponent(ref)}&translation=${translation}`);
      const data = await res.json();
      if (res.ok) {
        setVerseData({ text: data.text, translation: data.translation });
      } else {
        setVerseData({ text: "Passage text could not be loaded.", translation: "" });
      }
    } catch {
      setVerseData({ text: "Error loading passage.", translation: "" });
    } finally {
      setLoading(false);
    }
  };

  // Regex for verse references
  const SCRIPTURE_REGEX = /\b((?:[1-3]\s+)?[A-Z][a-z]+(?:\.|\b))\s+(\d+):(\d+)(?:-(\d+))?\b/g;

  const parts = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = SCRIPTURE_REGEX.exec(content)) !== null) {
    const matchedText = match[0];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      parts.push(content.substring(lastIndex, matchIndex));
    }

    parts.push(
      <button
        key={matchIndex}
        onClick={() => fetchVerse(matchedText)}
        className="scripture-link font-serif italic"
      >
        <BookOpen className="w-3.5 h-3.5 inline mr-1 text-[#C59B27]" />
        {matchedText}
      </button>
    );

    lastIndex = matchIndex + matchedText.length;
  }

  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return (
    <div className="relative">
      <div className="whitespace-pre-wrap leading-relaxed">{parts}</div>

      {/* Popover Card */}
      {activeRef && (
        <div className="fixed bottom-8 right-8 z-50 w-96 parchment-card p-6 shadow-2xl border border-[#C59B27]/40 space-y-4 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3">
            <div className="flex items-center gap-2 font-serif font-bold text-lg text-[#1A1815]">
              <BookOpen className="w-5 h-5 text-[#C59B27]" />
              <span>{activeRef}</span>
            </div>
            <button
              onClick={() => setActiveRef(null)}
              className="p-1 rounded-lg hover:bg-[#D4C9B8]/30 text-[#665C52] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Translation Picker Pills */}
          <div className="flex items-center gap-1.5 pt-1">
            {TRANSLATIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setSelectedTranslation(t.id);
                  fetchVerse(activeRef, t.id);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  selectedTranslation === t.id
                    ? "bg-[#C59B27] text-white shadow-xs"
                    : "bg-black/5 hover:bg-black/10 text-[#665C52]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-6 text-[#C59B27]">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-serif italic text-base text-[#1A1815] leading-relaxed">
                "{verseData?.text}"
              </p>
              {verseData?.translation && (
                <span className="inline-block badge-gold text-[10px]">
                  {verseData.translation}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
