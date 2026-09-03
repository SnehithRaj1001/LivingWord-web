"use client";

import { useState, useTransition } from "react";
import { Calendar, User, Church, Tag, ArrowUpRight, Eye, PenTool } from "lucide-react";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import Link from "next/link";

interface NoteFormClientProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    title?: string;
    date?: string;
    speaker?: string;
    church?: string;
    tags?: string;
    content?: string;
  };
  submitLabel?: string;
  cancelHref?: string;
}

export default function NoteFormClient({
  action,
  defaultValues = {},
  submitLabel = "Save Sermon Note",
  cancelHref = "/notes",
}: NoteFormClientProps) {
  const [isPending, startTransition] = useTransition();

  const [title, setTitle]     = useState(defaultValues.title   ?? "");
  const [date, setDate]       = useState(defaultValues.date    ?? new Date().toISOString().split("T")[0]);
  const [speaker, setSpeaker] = useState(defaultValues.speaker ?? "");
  const [church, setChurch]   = useState(defaultValues.church  ?? "");
  const [tags, setTags]       = useState(defaultValues.tags    ?? "");
  const [content, setContent] = useState(defaultValues.content ?? "");

  const parsedTags = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const formattedDate = date
    ? new Date(date + "T00:00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(fd);
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-8 items-start">

      {/* ── Left: Form ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#1A1815]">Note Title</label>
          <input
            type="text"
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Walking in Faith & Patience"
            className="input-field font-serif text-2xl font-bold"
          />
        </div>

        {/* Metadata row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C59B27]" /> Date
            </label>
            <input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2">
              <User className="w-4 h-4 text-[#C59B27]" /> Speaker
            </label>
            <input
              type="text"
              name="speaker"
              value={speaker}
              onChange={(e) => setSpeaker(e.target.value)}
              placeholder="e.g. Pastor John"
              className="input-field"
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2">
              <Church className="w-4 h-4 text-[#C59B27]" /> Service / Church
            </label>
            <input
              type="text"
              name="church"
              value={church}
              onChange={(e) => setChurch(e.target.value)}
              placeholder="e.g. Sunday Service"
              className="input-field"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#7A2E2E]" /> Tags (comma separated)
          </label>
          <input
            type="text"
            name="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="faith, patience, prayer"
            className="input-field"
          />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-[#1A1815]">Content / Sermon Notes</label>
          <MarkdownEditor
            name="content"
            required
            rows={18}
            defaultValue={defaultValues.content}
            placeholder="Write your sermon notes in markdown... Headings, bold, blockquotes, bullet lists all supported."
            onContentChange={setContent}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[--border-subtle]">
          <Link href={cancelHref} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={isPending} className="btn-primary">
            {isPending ? "Saving…" : submitLabel}
          </button>
        </div>
      </form>

      {/* ── Right: Live Note Card Preview ───────────────────────── */}
      <div className="hidden xl:block sticky top-24 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#968A7C]">
          <Eye className="w-3.5 h-3.5" />
          <span>Card Preview</span>
        </div>

        <div className="parchment-card p-8 flex flex-col justify-between space-y-6 min-h-[280px]">
          <div className="space-y-4">
            {/* Title row */}
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-serif text-xl font-bold text-[#1A1815] line-clamp-2 leading-snug">
                {title || <span className="text-[#C5B99A] italic font-normal">Untitled note…</span>}
              </h3>
              <div className="w-8 h-8 rounded-full bg-white/50 border border-[--border-subtle] flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-4 h-4 text-[#968A7C]" />
              </div>
            </div>

            {/* Content preview */}
            <p className="text-sm text-[#665C52] line-clamp-3 leading-relaxed">
              {content
                .replace(/#{1,6}\s/g, "")       // strip headings
                .replace(/\*\*(.*?)\*\*/g, "$1") // strip bold
                .replace(/\*(.*?)\*/g, "$1")     // strip italic
                .replace(/~~(.*?)~~/g, "$1")     // strip strikethrough
                .replace(/`(.*?)`/g, "$1")       // strip inline code
                .replace(/\[(.*?)\]\(.*?\)/g, "$1") // strip links
                .replace(/^[-*>]\s+/gm, "")      // strip list/quote prefixes
                .replace(/\n+/g, " ")
                .trim() || <span className="italic text-[#C5B99A]">Note content will appear here…</span>
              }
            </p>
          </div>

          {/* Footer */}
          <div className="space-y-4 pt-5 border-t border-[--border-subtle]">
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#665C52]">
              {formattedDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#C59B27]" />
                  {formattedDate}
                </span>
              )}
              {speaker && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-[#C59B27]" />
                  {speaker}
                </span>
              )}
              {church && (
                <span className="flex items-center gap-1.5">
                  <Church className="w-4 h-4 text-[#C59B27]" />
                  {church}
                </span>
              )}
            </div>

            {parsedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {parsedTags.map((tag) => (
                  <span key={tag} className="badge-wine">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-[10px] text-[#C5B99A] font-mono tracking-wider text-center select-none">
          ✦ Updates as you type
        </p>
      </div>

    </div>
  );
}
