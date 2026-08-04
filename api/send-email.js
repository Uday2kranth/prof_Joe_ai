import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { recipientEmail, subject, textContent, htmlContent, attachments } = req.body || {};

  if (!recipientEmail || (!textContent && !htmlContent)) {
    return res.status(400).json({ error: 'Recipient email and note content are required.' });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailClientId = process.env.GMAIL_CLIENT_ID;
  const gmailClientSecret = process.env.GMAIL_CLIENT_SECRET;
  const gmailRefreshToken = process.env.GMAIL_REFRESH_TOKEN;

  if (!gmailUser || !gmailClientId || !gmailClientSecret || !gmailRefreshToken) {
    return res.status(400).json({
      error: 'Email capabilities are currently inactive. Please configure GMAIL credentials in Vercel environment variables.'
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: gmailUser,
        clientId: gmailClientId,
        clientSecret: gmailClientSecret,
        refreshToken: gmailRefreshToken
      }
    });

    const mailOptions = {
      from: `"Prof. Joe AI — OU Exam Assistant" <${gmailUser}>`,
      to: recipientEmail,
      subject: subject || '🎓 Your Prof. Joe AI Study Notes & Exam Summary',
      text: textContent || 'Attached is your study session summary from Prof. Joe AI.',
      html: htmlContent || `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🎓 Prof. Joe AI — Exam Study Notes</h2>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px;">
          ${textContent ? textContent.replace(/\n/g, '<br/>') : ''}
        </div>
        <p style="margin-top: 20px; font-size: 0.85rem; color: #64748b;">Sent via Prof. Joe AI Engine — Osmania Exam Companion.</p>
      </div>`,
      attachments: attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('Email Transporter Error:', err);
    return res.status(500).json({ error: err.message || 'Failed to deliver email' });
  }
}
