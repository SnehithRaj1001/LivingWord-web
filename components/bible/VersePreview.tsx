"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, X, Loader2 } from "lucide-react";

// Same verse regex as ScriptureParser
const SCRIPTURE_REGEX = /\b((?:[1-3]\s+)?[A-Z][a-z]+(?:\.|))\s+(\d+):(\d+)(?:-(\d+))?\b/g;

const TRANSLATIONS = [
  { id: "de4e12af7f28f599-02", name: "KJV" },
  { id: "06125adad2d5898a-01", name: "ASV" },
  { id: "a81b73293d3080c9-01", name: "AMP" },
  { id: "78a9f6124f344018-01", name: "NASB" },
];

interface VerseData {
  text: string;
  translation: string;
}

interface VersePreviewProps {
  content: string; // The current markdown content
}

export default function VersePreview({ content }: VersePreviewProps) {
  const [ref, setRef]           = useState<string | null>(null);
  const [verseData, setVerseData] = useState<VerseData | null>(null);
  const [loading, setLoading]   = useState(false);
  const [translation, setTranslation] = useState(TRANSLATIONS[0].id);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Detect the last verse reference typed in the content
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const matches: string[] = [];
      let m: RegExpExecArray | null;
      const re = new RegExp(SCRIPTURE_REGEX.source, "g");
      while ((m = re.exec(content)) !== null) matches.push(m[0]);
      const last = matches[matches.length - 1] ?? null;

      if (last && last !== dismissed) {
        setRef(last);
      } else if (!last) {
        setRef(null);
        setVerseData(null);
        setDismissed(null);
      }
    }, 600); // wait 600ms after typing stops
  }, [content, dismissed]);

  // Fetch verse whenever ref or translation changes
  useEffect(() => {
    if (!ref) return;
    let cancelled = false;
    setLoading(true);
    setVerseData(null);
    fetch(`/api/bible/verse?ref=${encodeURIComponent(ref)}&translation=${translation}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setVerseData({ text: d.text, translation: d.translation });
      })
      .catch(() => {
        if (!cancelled) setVerseData({ text: "Could not load verse.", translation: "" });
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [ref, translation]);

  if (!ref) return null;

  return (
    <div style={{
      marginTop: "12px",
      borderRadius: "14px",
      border: "1px solid rgba(197,155,39,0.35)",
      background: "linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(249,243,232,0.8) 100%)",
      boxShadow: "0 4px 20px -4px rgba(197,155,39,0.15)",
      padding: "16px 20px",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      backdropFilter: "blur(10px)",
      animation: "fadeSlideIn 0.2s ease",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <BookOpen style={{ width: "16px", height: "16px", color: "#C59B27" }} />
          <span style={{ fontFamily: "Georgia, serif", fontWeight: 700, fontSize: "15px", color: "#1A1815" }}>
            {ref}
          </span>
          <span style={{ fontSize: "10px", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em", color: "#C5B99A" }}>
            ✦ Live Preview
          </span>
        </div>
        <button
          type="button"
          onClick={() => { setDismissed(ref); setRef(null); setVerseData(null); }}
          style={{ padding: "4px", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", color: "#968A7C" }}
        >
          <X style={{ width: "14px", height: "14px" }} />
        </button>
      </div>

      {/* Translation pills */}
      <div style={{ display: "flex", gap: "6px" }}>
        {TRANSLATIONS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTranslation(t.id)}
            style={{
              padding: "3px 10px",
              borderRadius: "6px",
              fontSize: "11px",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              background: translation === t.id ? "#C59B27" : "rgba(0,0,0,0.06)",
              color: translation === t.id ? "white" : "#665C52",
              transition: "all 0.15s",
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Verse text */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "12px 0" }}>
          <Loader2 style={{ width: "18px", height: "18px", color: "#C59B27", animation: "spin 1s linear infinite" }} />
        </div>
      ) : verseData ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: "14px", color: "#1A1815", lineHeight: 1.7, margin: 0 }}>
            &ldquo;{verseData.text}&rdquo;
          </p>
          {verseData.translation && (
            <span style={{
              display: "inline-block",
              background: "linear-gradient(135deg,rgba(197,155,39,.1),rgba(197,155,39,.05))",
              color: "#B8941F",
              border: "1px solid rgba(197,155,39,.2)",
              borderRadius: "999px",
              padding: "2px 10px",
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              width: "fit-content",
            }}>
              {verseData.translation}
            </span>
          )}
        </div>
      ) : null}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
