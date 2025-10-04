import nodemailer from 'nodemailer';
import { google } from 'googleapis';

// Gmail OAuth 2.0 configuration
const { OAuth2 } = google.auth;

interface EmailConfig {
  user: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  accessToken?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      user: process.env.EMAIL_USER || '',
      clientId: process.env.EMAIL_CLIENT_ID || '',
      clientSecret: process.env.EMAIL_CLIENT_SECRET || '',
      refreshToken: process.env.EMAIL_REFRESH_TOKEN || '',
      accessToken: process.env.EMAIL_ACCESS_TOKEN || '',
    };
  }

  async initialize() {
    try {
      // Create OAuth2 client
      const oauth2Client = new OAuth2(
        this.config.clientId,
        this.config.clientSecret,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: this.config.refreshToken,
      });

      // Get access token
      const { token } = await oauth2Client.getAccessToken();
      
      if (!token) {
        throw new Error('Failed to get access token');
      }

      // Create transporter with OAuth2
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: this.config.user,
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
          refreshToken: this.config.refreshToken,
          accessToken: token,
        },
      } as nodemailer.TransportOptions);

      console.log('Email service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email service:', error);
      return false;
    }
  }

  async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      if (!this.transporter) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('Email service not initialized');
        }
      }

      const mailOptions = {
        from: `EaaS Platform <${this.config.user}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html),
      };

      const result = await this.transporter!.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }

  // Development mode fallback
  async sendEmailDev(to: string, subject: string, html: string) {
    console.log('📧 [DEV MODE] Email would be sent:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', this.stripHtml(html));
    console.log('---');
    
    return { success: true, messageId: 'dev-mode-' + Date.now() };
  }
}

export const emailService = new EmailService();