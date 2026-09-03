import Navbar from "@/components/ui/Navbar";
import { createNote } from "@/lib/notes/actions";
import { createClient } from "@/lib/supabase/server";
import { Calendar, User, Church, Tag, ArrowLeft, PenTool } from "lucide-react";
import Link from "next/link";
import MarkdownEditor from "@/components/ui/MarkdownEditor";

export default async function NewNotePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#C59B27]/10 rounded-full blur-[120px] pointer-events-none" />
      <Navbar userEmail={user?.email} />

      <main className="relative z-10 flex-1 w-full px-8 py-12 space-y-8">
        <Link href="/notes" className="inline-flex items-center gap-2 text-sm font-semibold text-[#665C52] hover:text-[#1A1815] transition-colors bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-[--border-subtle]">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="parchment-card p-10 space-y-10">
          <div className="space-y-4 border-b border-[--border-subtle] pb-8">
            <div className="inline-flex items-center gap-2 badge-gold">
              <PenTool className="w-4 h-4" />
              <span>Sermon Journal</span>
            </div>
            <h1 className="font-heading text-4xl font-bold text-[#1A1815]">Draft a New Note</h1>
            <p className="font-serif text-lg text-[#665C52]">
              Record your takeaways, scriptural references, and pastoral insights.
            </p>
          </div>

          <form action={createNote} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1A1815]">Note Title</label>
              <input type="text" name="title" required placeholder="e.g. Walking in Faith & Patience" className="input-field font-serif text-2xl font-bold" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2"><Calendar className="w-4 h-4 text-[#C59B27]" /> Date</label>
                <input type="date" name="date" defaultValue={new Date().toISOString().split("T")[0]} className="input-field" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2"><User className="w-4 h-4 text-[#C59B27]" /> Speaker</label>
                <input type="text" name="speaker" placeholder="e.g. Pastor John" className="input-field" />
              </div>
              <div className="space-y-3">
                <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2"><Church className="w-4 h-4 text-[#C59B27]" /> Service / Church</label>
                <input type="text" name="church" placeholder="e.g. Sunday Service" className="input-field" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-bold text-[#1A1815] flex items-center gap-2"><Tag className="w-4 h-4 text-[#7A2E2E]" /> Tags (comma separated)</label>
              <input type="text" name="tags" placeholder="faith, patience, prayer" className="input-field" />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1A1815]">Content / Sermon Notes</label>
              <MarkdownEditor name="content" required rows={18} placeholder="Write your sermon notes in markdown... Type a verse like John 3:16 to see a live verse card." />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-[--border-subtle]">
              <Link href="/notes" className="btn-secondary">Cancel</Link>
              <button type="submit" className="btn-primary">Save Sermon Note</button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
