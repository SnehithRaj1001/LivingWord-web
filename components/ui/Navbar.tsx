import Link from "next/link";
import { BookOpen, UserCircle, LogOut, Sparkles } from "lucide-react";
import { logout } from "@/lib/auth/actions";

export default function Navbar({ userEmail }: { userEmail?: string }) {
  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[--bg-primary]/70 border-b border-[--border-subtle] shadow-sm">
      <div className="w-full px-8 h-20 flex items-center justify-between">
        
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C59B27] to-[#B8941F] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-5 h-5" />
          </div>
          <span className="font-heading text-2xl font-bold text-[#1A1815] tracking-tight">
            Living<span className="gold-text-gradient">Word</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {userEmail ? (
            <>
              <Link href="/notes" className="text-sm font-bold text-[#665C52] hover:text-[#C59B27] transition-colors">
                My Notebook
              </Link>
              <Link href="/ask" className="text-sm font-bold text-[#665C52] hover:text-[#5B7566] transition-colors flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#5B7566]" /> Ask Notes
              </Link>
              <div className="h-6 w-px bg-[--border-subtle]" />
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[#1A1815] flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#C59B27]" />
                  {userEmail}
                </span>
                <form action={logout}>
                  <button type="submit" className="p-2 rounded-full hover:bg-[--border-subtle] text-[#665C52] hover:text-[#7A2E2E] transition-colors" title="Log out">
                    <LogOut className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-[#665C52] hover:text-[#1A1815] transition-colors">
                Sign In
              </Link>
              <Link href="/signup" className="btn-primary py-2.5 px-5 text-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
