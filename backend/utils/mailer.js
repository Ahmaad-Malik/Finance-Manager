const nodemailer = require('nodemailer');

// Uses your Gmail account (EMAIL_USER) + app password (EMAIL_PASS) from .env to send mail.
//
// NOTE: using `service: 'gmail'` lets Nodemailer pick the host/port itself, and on
// some hosts (Render included) the resulting connection resolves over IPv6, which
// Gmail's SMTP servers can silently hang on -> "Connection timeout". Being explicit
// about host/port and forcing IPv4 (family: 4) avoids that.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for port 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // force IPv4
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

const sendOtpEmail = async (toEmail, otp, name = '') => {
  await transporter.sendMail({
    from: `"CashFin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Verify your CashFin account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="margin-bottom: 4px;">Verify your email</h2>
        <p>Hi ${name || 'there'},</p>
        <p>Use the code below to verify your email and finish creating your CashFin account:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${otp}</p>
        <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOtpEmail;
