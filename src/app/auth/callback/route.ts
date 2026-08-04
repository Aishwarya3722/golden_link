import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);

    const roleCookie = cookies().get("golden_link_role")?.value as UserRole | undefined;
    const user = data.session?.user;

    if (user && roleCookie) {
      // The handle_new_user trigger already created a default 'senior'
      // profile row; update it to whichever role the person picked on
      // the welcome screen before we ever redirect them.
      await supabase.from("profiles").update({ role: roleCookie }).eq("id", user.id);
    }

    const destination = roleCookie ?? "senior";
    const response = NextResponse.redirect(`${origin}/${destination}`);
    response.cookies.delete("golden_link_role");
    return response;
  }

  return NextResponse.redirect(`${origin}/`);
}
