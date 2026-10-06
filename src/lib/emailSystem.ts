
import nodemailer from 'nodemailer';

/**
 * Email sending utility for Bangla Bazar using Nodemailer
 */

type EmailType = {
  to: string;
  subject: string;
  message: string;
  html?: string;
};

// Create a reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER, // your email address
    pass: process.env.EMAIL_PASS, // your email password or app-specific password
  },
});

const sendEmail = async ({ to, subject, message, html }: EmailType) => {
  try {
    console.log(`[EMAIL SYSTEM] Attempting to send email to: ${to}`);

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Bangla Bazar" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: message,
      html: html || `<p>${message}</p>`,
    });

    console.log(`[EMAIL SYSTEM] Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[EMAIL SYSTEM] Error sending email:', error);
    // Silent fail in development if no credentials, but return false
    return { success: false, error: error.message };
  }
};

export default sendEmail;
