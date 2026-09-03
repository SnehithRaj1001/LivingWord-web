"use server";

import { redirect } from "next/navigation";
import { createClient as createServerSupabase } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createServerSupabase();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect("/notes");
}

export async function signup(formData: FormData) {
  const supabase = await createServerSupabase();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  if (data.user) {
    await supabase.from("profiles").insert({
      id: data.user.id,
      email: email,
      full_name: fullName,
    });
  }

  return redirect("/login?message=Account created. Please log in.");
}

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  return redirect("/login");
}
