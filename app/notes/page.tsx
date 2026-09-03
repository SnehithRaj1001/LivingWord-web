import Link from "next/link";
import { getNotes } from "@/lib/notes/actions";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/ui/Navbar";
import NoteCard from "@/components/notes/NoteCard";
import { PlusCircle, Search, BookOpen, Sparkles, Filter } from "lucide-react";

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const notes = await getNotes(q, tag);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#C59B27]/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar userEmail={user?.email} />

      <main className="relative z-10 flex-1 w-full px-8 py-12 space-y-10">
        
        {/* Header Banner */}
        <div className="parchment-card p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 badge-gold">
              <Sparkles className="w-4 h-4" />
              <span>Personal Library</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#1A1815]">Sermon Notes</h1>
            <p className="font-serif text-lg text-[#665C52]">
              Your collection of spiritual reflections, sermon insights, and scripture teachings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <form method="GET" className="relative flex-1 sm:w-80">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#968A7C]" />
              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search titles, tags, speakers..."
                className="input-field pl-12"
              />
            </form>

            <Link href="/notes/new" className="btn-primary whitespace-nowrap">
              <PlusCircle className="w-5 h-5" />
              <span>New Note</span>
            </Link>
          </div>
        </div>

        {/* Notes Grid or Empty State */}
        {notes.length === 0 ? (
          <div className="parchment-card p-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#C59B27]/20 to-[#C59B27]/5 flex items-center justify-center text-[#C59B27] shadow-inner border border-[#C59B27]/20">
              <BookOpen className="w-10 h-10" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="font-serif text-2xl font-bold text-[#1A1815]">No notes found</h3>
              <p className="text-base text-[#665C52] leading-relaxed">
                {q ? "We couldn't find any notes matching your search query." : "Your spiritual journal is empty. Start by recording your first sermon note today."}
              </p>
            </div>
            <div className="pt-4">
              <Link href="/notes/new" className="btn-primary">
                <PlusCircle className="w-5 h-5" />
                <span>Create Your First Note</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm font-semibold text-[#665C52] px-2">
              <span>Showing {notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
              {tag && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#7A2E2E]/10 text-[#7A2E2E]">
                  <Filter className="w-4 h-4" /> Tagged: #{tag}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {notes.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
