"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/providers/SupabaseProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-300">
            Sign in to your EaaS account to continue
          </p>
        </div>

        <Card className="p-8 bg-gray-800/50 border-gray-700\">
          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            variant=\"outline\"
            className=\"w-full mb-6 bg-gray-700/50 border-gray-600 hover:bg-gray-600/50\"
          >
            <svg className=\"w-5 h-5 mr-3\" viewBox=\"0 0 24 24\">
              <path
                fill=\"currentColor\"
                d=\"M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z\"
              />
              <path
                fill=\"currentColor\"
                d=\"M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z\"
              />
              <path
                fill=\"currentColor\"
                d=\"M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z\"
              />
              <path
                fill=\"currentColor\"
                d=\"M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z\"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className=\"relative mb-6\">
            <div className=\"absolute inset-0 flex items-center\">
              <div className=\"w-full border-t border-gray-600\"></div>
            </div>
            <div className=\"relative flex justify-center text-sm\">
              <span className=\"px-2 bg-gray-800 text-gray-400\">Or continue with email</span>
            </div>
          </div>

          {/* Email Sign In Form */}
          <form onSubmit={handleEmailSignIn} className=\"space-y-6\">
            {error && (
              <div className=\"bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-md text-sm\">
                {error}
              </div>
            )}

            <div>
              <label htmlFor=\"email\" className=\"block text-sm font-medium text-gray-300 mb-2\">
                Email address
              </label>
              <input
                id=\"email\"
                type=\"email\"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className=\"w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400\"
                placeholder=\"Enter your email\"
              />
            </div>

            <div>
              <label htmlFor=\"password\" className=\"block text-sm font-medium text-gray-300 mb-2\">
                Password
              </label>
              <input
                id=\"password\"
                type=\"password\"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className=\"w-full px-3 py-2 border border-gray-600 bg-gray-700/50 text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400\"
                placeholder=\"Enter your password\"
              />
            </div>

            <div className=\"flex items-center justify-between\">
              <div className=\"flex items-center\">
                <input
                  id=\"remember-me\"
                  type=\"checkbox\"
                  className=\"h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500\"
                />
                <label htmlFor=\"remember-me\" className=\"ml-2 block text-sm text-gray-300\">
                  Remember me
                </label>
              </div>
              <Link href=\"/auth/forgot-password\" className=\"text-sm text-blue-400 hover:text-blue-300\">
                Forgot password?
              </Link>
            </div>

            <Button
              type=\"submit\"
              disabled={loading || !email || !password}
              className=\"w-full bg-blue-600 hover:bg-blue-700\"
            >
              {loading ? \"Signing in...\" : \"Sign in\"}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className=\"mt-6 text-center text-sm\">
            <span className=\"text-gray-400\">Don't have an account? </span>
            <Link href=\"/auth/signup\" className=\"text-blue-400 hover:text-blue-300 font-medium\">
              Sign up
            </Link>
          </div>
        </Card>

        {/* Back to Home */}
        <div className=\"text-center\">
          <Link href=\"/\" className=\"text-sm text-gray-400 hover:text-gray-300\">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}"