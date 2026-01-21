
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh Session
    const { data: { user } } = await supabase.auth.getUser();

    // Route Protection Logic
    const path = request.nextUrl.pathname;

    // 1. Always allow Public Routes
    if (path.startsWith("/global-health-news") || path.startsWith("/api/cron") || path === "/" || path === "/login" || path === "/signup" || path === "/auth") {
        return response;
    }

    // 2. Protect Dashboard Routes
    if (!user && (path.startsWith("/analysis") || path.startsWith("/intel-feed") || path.startsWith("/reports"))) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 3. Redirect authenticated users away from login
    if (user && (path === "/login" || path === "/signup")) {
        return NextResponse.redirect(new URL("/analysis", request.url));
    }

    return response;
}
