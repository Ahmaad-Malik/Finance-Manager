const nodemailer = require('nodemailer');

// Uses your Gmail account (EMAIL_USER) + app password (EMAIL_PASS) from .env to send mail.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
        <p>This code expires in 2 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOtpEmail;
