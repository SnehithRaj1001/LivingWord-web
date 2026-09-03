import Link from "next/link";
import { Note } from "@/types/notes";
import { Calendar, User, Church, ArrowUpRight } from "lucide-react";

export default function NoteCard({ note }: { note: Note }) {
  return (
    <Link
      href={`/notes/${note.id}`}
      className="parchment-card p-8 group flex flex-col justify-between h-full space-y-6"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-2xl font-bold text-[#1A1815] group-hover:text-[#C59B27] transition-colors line-clamp-2 leading-snug">
            {note.title}
          </h3>
          <div className="w-8 h-8 rounded-full bg-white/50 border border-[--border-subtle] flex items-center justify-center shrink-0 group-hover:bg-[#C59B27] group-hover:border-[#C59B27] transition-all duration-300">
            <ArrowUpRight className="w-4 h-4 text-[#968A7C] group-hover:text-white transition-colors" />
          </div>
        </div>

        <p className="text-base text-[#665C52] line-clamp-3 leading-relaxed">
          {note.content}
        </p>
      </div>

      <div className="space-y-4 pt-5 border-t border-[--border-subtle]">
        <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-[#665C52]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#C59B27]" />
            {new Date(note.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          </span>
          {note.speaker && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-[#C59B27]" />
              {note.speaker}
            </span>
          )}
          {note.church && (
            <span className="flex items-center gap-1.5">
              <Church className="w-4 h-4 text-[#C59B27]" />
              {note.church}
            </span>
          )}
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {note.tags.map((tag) => (
              <span key={tag} className="badge-wine">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
