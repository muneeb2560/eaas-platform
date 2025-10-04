import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// In-memory storage for development (replace with database in production)
const verificationTokens = new Map<string, {
  email: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}>();

// Cleanup expired tokens every hour
setInterval(() => {
  const now = new Date();
  for (const [token, data] of verificationTokens.entries()) {
    if (data.expiresAt < now) {
      verificationTokens.delete(token);
    }
  }
}, 60 * 60 * 1000); // 1 hour

export interface VerificationTokenData {
  email: string;
  userId: string;
  exp?: number;
}

export class VerificationService {
  private jwtSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-dev-secret-key';
  }

  /**
   * Generate a verification token for email confirmation
   */
  generateVerificationToken(email: string, userId: string): string {
    const expiresIn = 24 * 60 * 60; // 24 hours in seconds
    const tokenData: VerificationTokenData = {
      email,
      userId,
      exp: Math.floor(Date.now() / 1000) + expiresIn
    };

    const token = jwt.sign(tokenData, this.jwtSecret);

    // Store in memory for development
    const expiresAt = new Date(Date.now() + (expiresIn * 1000));
    verificationTokens.set(token, {
      email,
      userId,
      createdAt: new Date(),
      expiresAt
    });

    return token;
  }

  /**
   * Verify and decode a verification token
   */
  verifyToken(token: string): VerificationTokenData | null {
    try {
      // Check if token exists in our store
      const storedData = verificationTokens.get(token);
      if (!storedData) {
        console.log('Token not found in store');
        return null;
      }

      // Check if expired
      if (storedData.expiresAt < new Date()) {
        verificationTokens.delete(token);
        console.log('Token expired');
        return null;
      }

      // Verify JWT
      const decoded = jwt.verify(token, this.jwtSecret) as VerificationTokenData;
      
      return decoded;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Mark token as used (remove from store)
   */
  consumeToken(token: string): boolean {
    const exists = verificationTokens.has(token);
    if (exists) {
      verificationTokens.delete(token);
    }
    return exists;
  }

  /**
   * Generate a secure random verification code
   */
  generateVerificationCode(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create verification URL
   */
  createVerificationUrl(token: string, baseUrl?: string): string {
    const base = baseUrl || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001';
    return `${base}/verify-email?token=${encodeURIComponent(token)}`;
  }

  /**
   * Get all active tokens (for debugging in development)
   */
  getActiveTokens(): Array<{token: string, data: { email: string; userId: string; createdAt: Date; expiresAt: Date }}> {
    const active = [];
    for (const [token, data] of verificationTokens.entries()) {
      if (data.expiresAt > new Date()) {
        active.push({ token, data });
      }
    }
    return active;
  }
}

export const verificationService = new VerificationService();