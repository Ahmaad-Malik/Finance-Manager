const nodemailer = require('nodemailer');

// EMAIL_USER / EMAIL_PASS come from environment variables (.env locally,
// Render dashboard env vars in production). EMAIL_PASS must be a Gmail
// "App Password", not the regular account password.
//
// We use the explicit SMTP host/port (587, STARTTLS) instead of the
// `service: 'gmail'` shorthand, and force IPv4 (`family: 4`). Some hosts
// (Render included) have broken/slow outbound IPv6 routing, and Gmail's
// SMTP endpoint prefers IPv6 when available — nodemailer then hangs until
// it times out instead of falling back to IPv4. Forcing IPv4 avoids that.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // implicit TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
});

async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"CashFin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'CashFin verification code',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Verify your email</h2>
        <p>Your CashFin verification code is:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>This code expires in 1 minute. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = sendOtpEmail;
