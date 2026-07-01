"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createServerSupabase();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email atau password salah." };
  }

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signup(formData: FormData) {
  const supabase = await createServerSupabase();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name || email.split("@")[0] } },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Cek email kamu untuk konfirmasi." };
}

export async function logout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
