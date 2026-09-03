import Navbar from "@/components/ui/Navbar";
import { createClient } from "@/lib/supabase/server";
import AskNotesClient from "@/components/ai/AskNotesClient";

export default async function AskPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#5B7566]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#C59B27]/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar userEmail={user?.email} />

      <main className="relative z-10 flex-1 w-full px-8 py-12 space-y-10">
        <AskNotesClient />
      </main>
    </div>
  );
}
