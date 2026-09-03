"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/notes");
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg border border-red-200 bg-red-50 text-xs text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[#665C52] mb-1">Email address</label>
        <input
          type="email"
          name="email"
          required
          className="w-full px-3 py-2 rounded-lg border border-[#D4C9B8] bg-white text-[#1A1815] focus:outline-none focus:ring-2 focus:ring-[#C59B27]/50"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[#665C52] mb-1">Password</label>
        <input
          type="password"
          name="password"
          required
          className="w-full px-3 py-2 rounded-lg border border-[#D4C9B8] bg-white text-[#1A1815] focus:outline-none focus:ring-2 focus:ring-[#C59B27]/50"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[#C59B27] hover:bg-[#B8941F] text-white font-medium transition-colors shadow-sm text-sm disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
