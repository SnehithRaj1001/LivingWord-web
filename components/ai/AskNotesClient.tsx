"use client";

import { useState, createContext, useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { askQuestionAction } from "@/lib/rag/ask-action";
import { RAGSearchResult } from "@/lib/rag/search";
import { Search, Sparkles, Loader2, BookOpen, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { TextSkeleton } from "@/components/ui/Skeleton";

export default function AskNotesClient() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<RAGSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const res = await askQuestionAction(question);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to search notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="parchment-card p-10 text-center space-y-4">
        <div className="inline-flex items-center gap-2 badge-gold mx-auto">
          <Sparkles className="w-4 h-4" />
          <span>Revelation Retriever</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#1A1815]">
          Ask Your Sermon Notes
        </h1>
        <p className="font-serif text-lg text-[#665C52] max-w-2xl mx-auto">
          Ask natural language questions like <em>&ldquo;What did I learn about faith and patience?&rdquo;</em> to perform semantic vector RAG search across your notebook.
        </p>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto pt-4">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your notes..."
            className="input-field pl-12 pr-32 py-4 text-base shadow-md"
          />
          <Search className="w-5 h-5 absolute left-4 top-1/2 translate-y-1 text-[#968A7C]" />
          <button
            type="submit"
            disabled={loading}
            className="btn-primary absolute right-2 top-1/2 translate-y-1 py-2 px-5 text-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ask AI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="parchment-card p-8 space-y-6">
          <div className="flex items-center gap-2 text-[#C59B27] font-semibold text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Searching vector embeddings and synthesizing revelation...</span>
          </div>
          <TextSkeleton />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* RAG Answer Display */}
      {result && !loading && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="parchment-card p-10 space-y-6 border-[#C59B27]/40 shadow-lg">
            <div className="flex items-center gap-3 border-b border-[--border-subtle] pb-4">
              <div className="p-2 rounded-xl bg-[#C59B27]/10 text-[#C59B27]">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#1A1815]">AI Answer Synthesis</h2>
            </div>

            {/* Rendered Markdown Answer */}
            <div className="prose-answer">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="font-heading text-2xl font-bold text-[#1A1815] mt-8 mb-3 first:mt-0">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="font-heading text-xl font-bold text-[#2C2415] mt-7 mb-3 first:mt-0">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="font-serif text-lg font-semibold text-[#3A2E1E] mt-5 mb-2">{children}</h3>
                  ),
                  p: ({ children }) => (
                    <p className="font-serif text-[17px] text-[#2C2415] leading-relaxed mb-4">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-bold text-[#1A1815]">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-[#4A3728]">{children}</em>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-[#C59B27] pl-5 py-1 my-4 bg-[#C59B27]/5 rounded-r-lg italic text-[#4A3728] font-serif text-[16px]">
                      {children}
                    </blockquote>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-none space-y-2 my-4 pl-2">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-outside space-y-1 my-4 pl-7 font-serif text-[#2C2415]">{children}</ol>
                  ),
                  li: ({ children, ordered }: any) => {
                    if (ordered === true) {
                      return (
                        <li className="font-serif text-[16px] text-[#2C2415] leading-relaxed" style={{ display: "list-item" }}>
                          {children}
                        </li>
                      );
                    }
                    return (
                      <li className="font-serif text-[16px] text-[#2C2415] leading-relaxed flex gap-2 items-start">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#C59B27] flex-shrink-0" />
                        <span>{children}</span>
                      </li>
                    );
                  },
                  hr: () => (
                    <hr className="my-6 border-none h-px bg-gradient-to-r from-transparent via-[#C59B27]/40 to-transparent" />
                  ),
                  code: ({ children }) => (
                    <code className="bg-[#F5EDD8] text-[#7A4C1E] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
                  ),
                  a: ({ href, children }) => (
                    <a href={href} className="text-[#5B7566] underline underline-offset-2 hover:text-[#3D5448] transition-colors">{children}</a>
                  ),
                }}
              >
                {result.answer}
              </ReactMarkdown>
            </div>
          </div>

          {/* Sources & Citations */}
          {result.sources.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#665C52] px-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#5B7566]" /> Referenced Sermon Note Chunks
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.sources.map((src, i) => (
                  <Link
                    key={i}
                    href={`/notes/${src.noteId}`}
                    className="parchment-card p-6 space-y-3 group hover:border-[#5B7566]"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#5B7566]">
                      <span>Source [{i + 1}]</span>
                      <span className="group-hover:translate-x-1 transition-transform">View Note &rarr;</span>
                    </div>
                    <p className="text-xs text-[#665C52] line-clamp-3 italic">
                      &ldquo;{src.content}&rdquo;
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
