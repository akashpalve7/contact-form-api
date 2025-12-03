// api/send-mail.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  // ✅ Add CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return res.status(200).end(); // respond OK for preflight
  }

  // Only allow POST for actual send-mail
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, error: "Method not allowed" });
  }

  try {
    const { name, email, message } = req.body;
    if (!email || !message)
      return res.status(400).json({ success: false, error: "Missing fields" });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.TO_EMAIL || process.env.EMAIL_USER,
      replyTo: email,
      subject: `New contact from ${name || "Website Visitor"}`,
      html: `
        <p><strong>Name:</strong> ${name || "—"}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("send-mail error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
