"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type VerificationStatus = 'loading' | 'success' | 'error' | 'invalid_token' | 'missing_token' | 'server_error';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const success = searchParams.get('success');
    const emailParam = searchParams.get('email');

    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    // Handle URL parameters from redirect
    if (success === 'true') {
      setStatus('success');
      setMessage('Your email has been verified successfully!');
      return;
    }

    if (error) {
      switch (error) {
        case 'missing_token':
          setStatus('missing_token');
          setMessage('Verification link is missing required information.');
          break;
        case 'invalid_token':
          setStatus('invalid_token');
          setMessage('This verification link is invalid or has expired.');
          break;
        case 'server_error':
          setStatus('server_error');
          setMessage('An error occurred while verifying your email. Please try again.');
          break;
        default:
          setStatus('error');
          setMessage('An unexpected error occurred.');
      }
      return;
    }

    // If we have a token, verify it
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('missing_token');
      setMessage('No verification token provided.');
    }
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      setStatus('loading');
      
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setEmail(data.data.email);
        setMessage('Your email has been verified successfully!');
        
        // Redirect to signin after 3 seconds
        setTimeout(() => {
          router.push('/auth/signin?verified=true');
        }, 3000);
      } else {
        if (data.code === 'TOKEN_INVALID') {
          setStatus('invalid_token');
          setMessage('This verification link is invalid or has expired.');
        } else if (data.code === 'TOKEN_USED') {
          setStatus('error');
          setMessage('This verification link has already been used.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify email.');
        }
      }
    } catch (error) {
      console.error('Error verifying email:', error);
      setStatus('server_error');
      setMessage('An error occurred while verifying your email. Please try again.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
      case 'invalid_token':
      case 'missing_token':
      case 'server_error':
        return '❌';
      default:
        return '📧';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'error':
      case 'invalid_token':
      case 'missing_token':
      case 'server_error':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
          <p className="text-gray-300">
            Confirming your email address
          </p>
        </div>

        <Card className="p-8 bg-gray-800/50 border-gray-700">
          <div className="text-center">
            <div className={`text-6xl mb-6 ${getStatusColor()}`}>
              {getStatusIcon()}
            </div>
            
            <h2 className={`text-xl font-semibold mb-4 ${getStatusColor()}`}>
              {status === 'loading' && 'Verifying Your Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
              {status === 'invalid_token' && 'Invalid Link'}
              {status === 'missing_token' && 'Missing Token'}
              {status === 'server_error' && 'Server Error'}
            </h2>

            <p className="text-gray-300 mb-6">
              {message}
            </p>

            {email && status === 'success' && (
              <div className="bg-green-900/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-md text-sm mb-6">
                <strong>Email:</strong> {email}
                <br />
                <span className="text-green-400">Account is now active!</span>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">
                  Redirecting to sign in page in 3 seconds...
                </p>
                <Link href="/auth/signin?verified=true">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Continue to Sign In
                  </Button>
                </Link>
              </div>
            )}

            {(status === 'error' || status === 'invalid_token' || status === 'server_error') && (
              <div className="space-y-4">
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    Try Signing Up Again
                  </Button>
                </Link>
                <p className="text-sm text-gray-400">
                  Need help? Contact support if the problem persists.
                </p>
              </div>
            )}

            {status === 'missing_token' && (
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  Sign Up for an Account
                </Button>
              </Link>
            )}
          </div>
        </Card>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-gray-300">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}