import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// 47都道府県slug
const PREF_SLUGS = new Set([
  "hokkaido",
  "aomori",
  "iwate",
  "miyagi",
  "akita",
  "yamagata",
  "fukushima",
  "ibaraki",
  "tochigi",
  "gunma",
  "saitama",
  "chiba",
  "tokyo",
  "kanagawa",
  "niigata",
  "toyama",
  "ishikawa",
  "fukui",
  "yamanashi",
  "nagano",
  "gifu",
  "shizuoka",
  "aichi",
  "mie",
  "shiga",
  "kyoto",
  "osaka",
  "hyogo",
  "nara",
  "wakayama",
  "tottori",
  "shimane",
  "okayama",
  "hiroshima",
  "yamaguchi",
  "tokushima",
  "kagawa",
  "ehime",
  "kochi",
  "fukuoka",
  "saga",
  "nagasaki",
  "kumamoto",
  "oita",
  "miyazaki",
  "kagoshima",
  "okinawa",
]);

export async function middleware(request: NextRequest) {
  const response = await updateSession(request);

  // /?reset=1 ならpref_slug Cookieを削除
  if (
    request.nextUrl.pathname === "/" &&
    request.nextUrl.searchParams.get("reset") === "1"
  ) {
    response.cookies.delete("pref_slug");
    return response;
  }

  // パス先頭が都道府県slugならCookieに保存
  const segments = request.nextUrl.pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && PREF_SLUGS.has(first)) {
    const current = request.cookies.get("pref_slug")?.value;
    if (current !== first) {
      response.cookies.set("pref_slug", first, {
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
        sameSite: "lax",
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
