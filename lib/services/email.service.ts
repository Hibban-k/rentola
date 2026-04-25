import nodemailer from 'nodemailer';

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    async sendEmail(to: string, subject: string, html: string) {
        try {
            await this.transporter.sendMail({
                from: `"Rentola" <${process.env.EMAIL_FROM}>`,
                to,
                subject,
                html,
            });
        } catch (error) {
            console.error("[EmailService] Error sending email:", error);
            // In production, you might want to retry or log to an error monitoring service
        }
    }

    async sendVerificationEmail(to: string, otp: string) {
        const subject = "Verify your Rentola account";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2B3674; text-align: center;">Welcome to Rentola!</h2>
                <p>Hello,</p>
                <p>Thank you for signing up. Please use the following OTP to verify your email address. This code is valid for 10 minutes.</p>
                <div style="background-color: #f4f7fe; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4318FF; border-radius: 8px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>If you didn't create an account, you can safely ignore this email.</p>
                <p>Best regards,<br/>The Rentola Team</p>
            </div>
        `;
        await this.sendEmail(to, subject, html);
    }

    async sendPasswordResetEmail(to: string, otp: string) {
        const subject = "Reset your Rentola password";
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #2B3674; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password. Use the following OTP to proceed with the reset. This code is valid for 10 minutes.</p>
                <div style="background-color: #fff5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #e53e3e; border-radius: 8px; margin: 20px 0;">
                    ${otp}
                </div>
                <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                <p>Best regards,<br/>The Rentola Team</p>
            </div>
        `;
        await this.sendEmail(to, subject, html);
    }
}

export const emailService = new EmailService();
