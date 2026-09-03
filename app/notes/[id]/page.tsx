import { getNoteById, deleteNote } from "@/lib/notes/actions";
import { notFound, redirect } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { createClient } from "@/lib/supabase/server";
import { Calendar, User, Church, ArrowLeft, Trash2, Edit3, BookOpen } from "lucide-react";
import Link from "next/link";
import ScriptureParser from "@/components/bible/ScriptureParser";
import SummaryCard from "@/components/ai/SummaryCard";

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const note = await getNoteById(id);
  if (!note) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#C59B27]/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar userEmail={user?.email} />

      <main className="relative z-10 flex-1 w-full px-8 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/notes" className="inline-flex items-center gap-2 text-sm font-semibold text-[#665C52] hover:text-[#1A1815] transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-[--border-subtle]">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/notes/${note.id}/edit`} className="btn-secondary px-4 py-2 text-sm flex items-center gap-1.5">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
            <form action={async () => {
              "use server";
              await deleteNote(note.id);
              redirect("/notes");
            }}>
              <button type="submit" className="p-2.5 rounded-xl bg-white/50 backdrop-blur-md border border-[--border-subtle] text-[#7A2E2E] hover:bg-[#7A2E2E] hover:text-white transition-all shadow-sm">
                <Trash2 className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="parchment-card p-12 space-y-10">
          <div className="space-y-6">
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {note.tags.map((tag) => (
                  <span key={tag} className="badge-wine">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            <h1 className="font-serif text-5xl font-black text-[#1A1815] leading-tight">
              {note.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-base font-semibold text-[#665C52] pb-8 border-b border-[--border-subtle]">
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C59B27]" />
                {new Date(note.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
              </span>
              {note.speaker && (
                <span className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#C59B27]" />
                  {note.speaker}
                </span>
              )}
              {note.church && (
                <span className="flex items-center gap-2">
                  <Church className="w-5 h-5 text-[#C59B27]" />
                  {note.church}
                </span>
              )}
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-[#1A1815]">
            <ScriptureParser content={note.content} />
          </div>
        </div>

        {/* AI Sermon Summary & Reflection Card */}
        <SummaryCard noteId={note.id} initialSummary={note.ai_summary} />
      </main>
    </div>
  );
}
