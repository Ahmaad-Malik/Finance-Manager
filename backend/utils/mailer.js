// Sends the OTP email via Brevo's HTTPS transactional email API instead of raw
// SMTP. Render (and several other hosts) can silently block or hang on
// outbound SMTP ports (465/587), which is what was causing the "Connection
// timeout" error. Brevo's API runs over normal HTTPS (port 443), which every
// host allows, so this sidesteps the problem entirely.
//
// Setup (one-time):
// 1. Create a free account at https://www.brevo.com
// 2. Go to Senders, Domains & Dedicated IPs -> Senders -> add
//    cahfin.otp@gmail.com as a sender and verify it (Brevo emails you a link).
// 3. Go to SMTP & API -> API Keys -> Generate a new API key.
// 4. Put that key in your .env (locally) and in Render's environment
//    variables as BREVO_API_KEY.

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

const sendOtpEmail = async (toEmail, otp, name = '') => {
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: 'CashFin', email: process.env.EMAIL_USER },
      to: [{ email: toEmail, name: name || undefined }],
      subject: 'Verify your CashFin account',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1a1a1a;">
          <h2 style="margin-bottom: 4px;">Verify your email</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Use the code below to verify your email and finish creating your CashFin account:</p>
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 24px 0;">${otp}</p>
          <p>This code expires in 2 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
  }
};

module.exports = sendOtpEmail;
