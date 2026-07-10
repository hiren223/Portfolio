import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { name, email, message } = req.body;

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    return res.status(400).json({ success: false, error: 'Please fill in all fields.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address.' });
  }

  const cleanName = name.replace(/[\r\n]/g, '').trim();

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Hiren Keraliya Portfolio" <${process.env.SMTP_EMAIL}>`,
      to: process.env.TO_EMAIL,
      replyTo: `"${cleanName}" <${email}>`,
      subject: `New portfolio message from ${cleanName} <${email}>`,
      text: `From   : ${cleanName}\nEmail  : ${email}\n\n${message}`,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Failed to send message.' });
  }
}