import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Database } from "../../../../supabase/types";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  // Check if we're in development mode
  const isDevelopmentMode = process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://your-project.supabase.co';
  
  if (isDevelopmentMode) {
    // In development mode, just redirect to dashboard
    // The SupabaseProvider handles mock authentication
    console.log('OAuth callback in development mode - redirecting to dashboard');
    return NextResponse.redirect(`${origin}/dashboard`);
  }

  // Production mode - handle real OAuth callback
  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch (error) {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing
              // user sessions.
            }
          },
        },
      }
    );
    
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      console.log('OAuth callback successful - redirecting to:', next);
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('OAuth callback error:', error);
  }

  // Return the user to an error page with instructions
  console.warn('OAuth callback failed - redirecting to auth error');
  return NextResponse.redirect(`${origin}/auth/signin?error=callback_failed`);
}