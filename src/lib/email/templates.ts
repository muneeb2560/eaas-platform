interface EmailTemplateData {
  userName: string;
  verificationUrl: string;
  companyName?: string;
}

export function createVerificationEmailTemplate(data: EmailTemplateData): { html: string; text: string } {
  const { userName, verificationUrl, companyName = 'EaaS Platform' } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - ${companyName}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
            color: #ffffff;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            transition: transform 0.2s ease;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        
        .cta-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .alternative-link {
            margin-top: 30px;
            padding: 20px;
            background-color: #f9fafb;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
        }
        
        .alternative-link p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .alternative-link a {
            color: #3b82f6;
            word-break: break-all;
            text-decoration: none;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 8px;
        }
        
        .footer .security-note {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 15px;
            font-style: italic;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            
            .header,
            .content,
            .footer {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .cta-button {
                display: block;
                width: 100%;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${companyName}</h1>
            <p>AI Model Evaluation Platform</p>
        </div>
        
        <div class="content">
            <div class="greeting">
                Hello ${userName}! 👋
            </div>
            
            <div class="message">
                Welcome to ${companyName}! We're excited to have you join our AI model evaluation platform. 
                To get started and secure your account, please verify your email address by clicking the button below.
            </div>
            
            <div class="cta-container">
                <a href="${verificationUrl}" class="cta-button">
                    ✓ Verify Email Address
                </a>
            </div>
            
            <div class="alternative-link">
                <p><strong>Button not working?</strong> Copy and paste this link into your browser:</p>
                <a href="${verificationUrl}">${verificationUrl}</a>
            </div>
        </div>
        
        <div class="footer">
            <p>This verification link will expire in 24 hours for security reasons.</p>
            <p>If you didn't create an account with ${companyName}, you can safely ignore this email.</p>
            
            <div class="security-note">
                🔒 This is an automated email from ${companyName}. Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
`;

  const text = `
Welcome to ${companyName}!

Hello ${userName},

Thank you for signing up for ${companyName}! To complete your registration and secure your account, please verify your email address.

Verification Link: ${verificationUrl}

This link will expire in 24 hours for security reasons.

If you didn't create an account with ${companyName}, you can safely ignore this email.

---
${companyName} Team
AI Model Evaluation Platform

This is an automated email. Please do not reply.
`;

  return { html, text };
}

export function createWelcomeEmailTemplate(data: { userName: string; loginUrl: string }): { html: string; text: string } {
  const { userName, loginUrl } = data;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to EaaS Platform</title>
    <style>
        body { font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; text-align: center; border-radius: 8px; }
        .content { padding: 30px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Welcome to EaaS Platform!</h1>
        <p>Your email has been verified successfully</p>
    </div>
    
    <div class="content">
        <h2>Hello ${userName}!</h2>
        <p>Congratulations! Your email has been verified and your account is now active.</p>
        <p>You can now access all the features of our AI model evaluation platform:</p>
        
        <ul>
            <li>Create and run evaluation experiments</li>
            <li>Upload custom datasets</li>
            <li>Use advanced rubrics for model testing</li>
            <li>Generate detailed performance reports</li>
        </ul>
        
        <p style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" class="button">Start Evaluating Models →</a>
        </p>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Best regards,<br>The EaaS Platform Team</p>
    </div>
</body>
</html>
`;

  const text = `
Welcome to EaaS Platform!

Hello ${userName}!

Congratulations! Your email has been verified and your account is now active.

You can now access all the features of our AI model evaluation platform:
- Create and run evaluation experiments
- Upload custom datasets  
- Use advanced rubrics for model testing
- Generate detailed performance reports

Get started: ${loginUrl}

If you have any questions, feel free to reach out to our support team.

Best regards,
The EaaS Platform Team
`;

  return { html, text };
}