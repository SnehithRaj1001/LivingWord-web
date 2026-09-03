import Link from "next/link";
import { BookOpen, Sparkles, Search, Feather, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-6 py-20 text-center relative overflow-hidden">
      
      {/* Sleek Modern Glowing Orbs in Background */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#C59B27]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#5B7566]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full space-y-16 relative z-10 px-4">
        {/* Hero Section */}
        <div className="space-y-8 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 badge-gold">
            <Feather className="w-3.5 h-3.5" />
            <span>Modern Antiquity Design System</span>
          </div>

          <h1 className="font-heading text-6xl sm:text-8xl font-black tracking-tight text-[#1A1815] leading-tight">
            Living<span className="gold-text-gradient">Word</span>
          </h1>

          <p className="font-serif text-2xl sm:text-3xl text-[#665C52] leading-relaxed max-w-3xl mx-auto font-medium">
            Your personal sermon notebook, interactive scripture assistant, and AI reflection companion.
          </p>

          <p className="text-lg text-[#968A7C] max-w-2xl mx-auto leading-relaxed">
            Organize church notes, parse scripture references like <span className="scripture-link">John 3:16</span> automatically, generate AI summaries, and semantically ask questions about what you've learned.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8 w-full max-w-md mx-auto sm:max-w-none">
            <Link href="/signup" className="btn-primary w-full sm:w-auto text-lg">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/notes" className="btn-secondary w-full sm:w-auto text-lg">
              Explore Notebook
            </Link>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left pt-10">
          <div className="parchment-card p-10 space-y-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C59B27]/20 to-[#C59B27]/5 flex items-center justify-center text-[#C59B27] shadow-inner border border-[#C59B27]/20 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1A1815]">Interactive Scripture</h3>
            <p className="text-base text-[#665C52] leading-relaxed">
              Deterministic regex parser highlights verses like <span className="scripture-link">Rom 8:28</span> and links to instant API.Bible verse popovers.
            </p>
          </div>

          <div className="parchment-card p-10 space-y-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#7A2E2E]/20 to-[#7A2E2E]/5 flex items-center justify-center text-[#7A2E2E] shadow-inner border border-[#7A2E2E]/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1A1815]">AI Summarizer</h3>
            <p className="text-base text-[#665C52] leading-relaxed">
              Server-side Gemini integration extracts key takeaways, themes, and spiritual lessons cached directly in PostgreSQL.
            </p>
          </div>

          <div className="parchment-card p-10 space-y-5 group">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5B7566]/20 to-[#5B7566]/5 flex items-center justify-center text-[#5B7566] shadow-inner border border-[#5B7566]/20 group-hover:scale-110 transition-transform duration-300">
              <Search className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#1A1815]">Revelation Retriever</h3>
            <p className="text-base text-[#665C52] leading-relaxed">
              Ask natural language questions like <em>"What did I write about patience?"</em> using pgvector RAG semantic search.
            </p>
          </div>
        </div>

        {/* Value Proposition Card */}
        <div className="parchment-card p-10 flex flex-col sm:flex-row items-center justify-between gap-8 text-left mt-8">
          <div className="space-y-3">
            <h4 className="font-serif text-3xl font-bold text-[#1A1815] flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#5B7566]/10 text-[#5B7566]">
                <ShieldCheck className="w-6 h-6" />
              </div>
              Private Knowledge Storage
            </h4>
            <p className="text-base text-[#665C52] max-w-xl">
              Your personal notes and vector embeddings are protected with strict Supabase Row Level Security (RLS). Only you have access.
            </p>
          </div>
          <Link href="/signup" className="btn-primary shrink-0 text-base">
            Create Your Account
          </Link>
        </div>
      </div>
    </main>
  );
}
