import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = [
  "/",
  "/customers",
  "/suppliers",
  "/products",
  "/raw-materials",
  "/recipes",
  "/stock",
  "/production-orders",
  "/sales-orders",
  "/financial",
  "/accounts-receivable",
  "/accounts-payable",
];

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedPath = protectedPaths.some((path) => {
    if (path === "/") {
      return pathname === "/";
    }

    return pathname === path || pathname.startsWith(`${path}/`);
  });

  if (!isProtectedPath) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/customers/:path*",
    "/suppliers/:path*",
    "/products/:path*",
    "/raw-materials/:path*",
    "/recipes/:path*",
    "/stock/:path*",
    "/production-orders/:path*",
    "/sales-orders/:path*",
    "/financial/:path*",
    "/accounts-receivable/:path*",
    "/accounts-payable/:path*",
  ],
};