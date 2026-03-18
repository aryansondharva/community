import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data?: Record<string, any>;
}

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Email templates
const getEmailTemplate = (template: string, data: Record<string, any> = {}): string => {
  const templates: Record<string, string> = {
    'email-verification': `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - HackHub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚀 HackHub</h1>
          <p>Verify Your Email Address</p>
        </div>
        <div class="content">
          <h2>Hi ${data.fullName},</h2>
          <p>Thank you for joining HackHub! To complete your registration and start your hackathon journey, please verify your email address.</p>
          <p>Click the button below to verify your email:</p>
          <a href="${data.verificationLink}" class="button">Verify Email</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${data.verificationLink}</p>
          <p><strong>Note:</strong> This verification link will expire in 24 hours.</p>
        </div>
        <div class="footer">
          <p>If you didn't create an account with HackHub, you can safely ignore this email.</p>
          <p>&copy; 2024 HackHub. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    'password-reset': `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - HackHub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 HackHub</h1>
          <p>Reset Your Password</p>
        </div>
        <div class="content">
          <h2>Hi ${data.fullName},</h2>
          <p>We received a request to reset your password for your HackHub account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${data.resetLink}" class="button">Reset Password</a>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">${data.resetLink}</p>
          <div class="warning">
            <p><strong>⚠️ Security Notice:</strong></p>
            <ul>
              <li>This reset link will expire in 10 minutes</li>
              <li>If you didn't request a password reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>If you have any concerns about your account security, please contact our support team.</p>
          <p>&copy; 2024 HackHub. All rights reserved.</p>
        </div>
      </body>
      </html>
    `,
    'welcome': `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to HackHub</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .feature { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #667eea; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Welcome to HackHub!</h1>
          <p>Your Hackathon Journey Begins</p>
        </div>
        <div class="content">
          <h2>Hi ${data.fullName},</h2>
          <p>Welcome to HackHub! We're excited to have you join our community of innovators, creators, and problem-solvers.</p>
          
          <h3>🚀 What can you do with HackHub?</h3>
          <div class="feature">
            <h4>🏆 Join Hackathons</h4>
            <p>Discover and participate in exciting hackathon events from around the world.</p>
          </div>
          <div class="feature">
            <h4>👥 Build Teams</h4>
            <p>Connect with talented developers, designers, and innovators to form amazing teams.</p>
          </div>
          <div class="feature">
            <h4>💼 Showcase Projects</h4>
            <p>Display your amazing projects and build your portfolio.</p>
          </div>
          <div class="feature">
            <h4>🎯 Earn Badges</h4>
            <p>Get recognized for your achievements and skills with our badge system.</p>
          </div>
          
          <a href="${process.env.FRONTEND_URL}/dashboard" class="button">Get Started</a>
          
          <p>Need help? Check out our <a href="${process.env.FRONTEND_URL}/help">Help Center</a> or <a href="${process.env.FRONTEND_URL}/contact">contact support</a>.</p>
        </div>
        <div class="footer">
          <p>Happy hacking! 🚀</p>
          <p>&copy; 2024 HackHub. All rights reserved.</p>
        </div>
      </body>
      </html>
    `
  };

  return templates[template] || templates['welcome'];
};

// Send email function
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const html = getEmailTemplate(options.template, options.data);

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'HackHub'}" <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};

// Test email configuration
export const testEmailConfig = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};
