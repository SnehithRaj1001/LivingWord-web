import Link from "next/link";
import { BookOpen, ShieldCheck, Zap } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const { error, message } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Sleek Modern Glowing Orbs in Background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#C59B27]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#5B7566]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-heading text-4xl font-black text-[#1A1815]">
            <BookOpen className="w-8 h-8 text-[#C59B27]" />
            Living<span className="gold-text-gradient">Word</span>
          </Link>
          <h2 className="font-serif text-xl font-medium text-[#665C52]">Sign in to your notebook</h2>
        </div>

        <div className="parchment-card p-10 space-y-8">
          {error && (
            <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700 leading-relaxed font-medium shadow-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 text-sm text-green-700 leading-relaxed font-medium shadow-sm">
              {message}
            </div>
          )}

          <LoginForm />

          <div className="pt-6 border-t border-[--border-subtle] text-center">
            <p className="text-sm text-[#665C52]">
              Don't have an account yet?{" "}
              <Link href="/signup" className="text-[#C59B27] hover:text-[#B8941F] font-bold transition-colors">
                Create account
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-sm font-semibold text-[#968A7C] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#5B7566]" />
          <span>Encrypted RLS Personal Storage</span>
        </div>
      </div>
    </div>
  );
}
