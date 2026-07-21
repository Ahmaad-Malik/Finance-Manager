const nodemailer = require('nodemailer');

// EMAIL_USER / EMAIL_PASS come from environment variables (.env locally,
// Render dashboard env vars in production). EMAIL_PASS must be a Gmail
// "App Password", not the regular account password.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: `"CashFin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your CashFin verification code',
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
