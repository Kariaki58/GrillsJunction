import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    console.error('Middleware auth error:', error);
  }

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname.startsWith('/admin');

  // If user is not authenticated and trying to access admin
  if (!user && isAdminPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is authenticated and trying to access login/signup
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
