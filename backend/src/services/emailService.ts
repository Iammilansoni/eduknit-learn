import nodemailer from 'nodemailer';
import logger from '../config/logger';

/**
 * Email Service for sending transactional emails
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailTemplate {
  subject: string;
  html: (data: any) => string;
  text?: (data: any) => string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"EduKnit Learn" <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    resetUrl: string
  ): Promise<boolean> {
    const subject = 'Password Reset Request - EduKnit Learn';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EduKnit Learn</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6;">
            You requested a password reset for your EduKnit Learn account. 
            Click the button below to reset your password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          
          <p style="color: #667eea; word-break: break-all;">
            ${resetUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            This link will expire in 1 hour for security reasons.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            If you didn't request this password reset, please ignore this email.
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 14px;">
            © 2024 EduKnit Learn. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const text = `
      Password Reset Request - EduKnit Learn
      
      You requested a password reset for your EduKnit Learn account.
      Click the link below to reset your password:
      
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      If you didn't request this password reset, please ignore this email.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send email verification email
   */
  async sendEmailVerification(
    email: string,
    verificationToken: string,
    verificationUrl: string
  ): Promise<boolean> {
    const subject = 'Verify Your Email - EduKnit Learn';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EduKnit Learn</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome to EduKnit Learn!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with EduKnit Learn. To complete your registration, 
            please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Verify Email
            </a>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          
          <p style="color: #667eea; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            🔐 <strong>This verification link will expire in 15 minutes.</strong>
          </p>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 14px;">
            © 2024 EduKnit Learn. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const text = `
      Welcome to EduKnit Learn!
      
      Thank you for registering with EduKnit Learn. To complete your registration, 
      please verify your email address by clicking the link below:
      
      ${verificationUrl}
      
      🔐 This verification link will expire in 15 minutes.
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string
  ): Promise<boolean> {
    const subject = 'Welcome to EduKnit Learn!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">EduKnit Learn</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome, ${firstName}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for joining EduKnit Learn! We're excited to have you as part of our 
            learning community. You now have access to our comprehensive educational resources.
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Here's what you can do next:
          </p>
          
          <ul style="color: #666; line-height: 1.6;">
            <li>Explore our course catalog</li>
            <li>Complete your profile</li>
            <li>Join study groups</li>
            <li>Track your learning progress</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      display: inline-block;
                      font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; padding: 20px; text-align: center;">
          <p style="color: #999; margin: 0; font-size: 14px;">
            © 2024 EduKnit Learn. All rights reserved.
          </p>
        </div>
      </div>
    `;

    const text = `
      Welcome to EduKnit Learn!
      
      Thank you for joining EduKnit Learn! We're excited to have you as part of our 
      learning community. You now have access to our comprehensive educational resources.
      
      Visit your dashboard to get started: ${process.env.FRONTEND_URL}/dashboard
    `;

    return this.sendEmail({
      to: email,
      subject,
      html,
      text,
    });
  }

  /**
   * Test email service
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      logger.info('Email service connection verified');
      return true;
    } catch (error) {
      logger.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;