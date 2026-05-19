import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Pastikan utilitas server client terpasang
import { ROUTES } from "@/utils/routes";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Jika ada parameter pengalihan bawaan, gunakan itu, jika tidak arahkan ke Home
  const next = searchParams.get("next") ?? ROUTES.HOME;

  if (code) {
    const supabase = await createClient();
    // Tukar kode token otentikasi dari Google dengan session aktif Supabase
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika otentikasi gagal, pulangkan kembali ke halaman login dengan parameter error
  return NextResponse.redirect(`${origin}${ROUTES.LOGIN}?error=auth-failed`);
}
