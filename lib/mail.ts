import nodemailer from "nodemailer";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<string | null> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || `"MedTech Support" <noreply@medtech.com>`;

  const isPlaceholder = !smtpUser || smtpUser === "your-email@gmail.com";

  if (!isPlaceholder) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpFrom,
        to,
        subject,
        html,
      });
      return null;
    } catch (err) {
      console.error("Configured SMTP failed, falling back to Ethereal:", err);
    }
  }

  // Fallback to Ethereal Email for testing in development/mock situations
  try {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"MedTech Support (Testing)" <noreply@medtech.com>`,
      to,
      subject: `${subject} (Testing)`,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log("\n=========================================");
    console.log(`EMAIL SENT (ETHEREAL):`);
    console.log("To:", to);
    console.log("Subject:", subject);
    if (previewUrl) {
      console.log("Email Preview URL:", previewUrl);
    }
    console.log("=========================================\n");
    return previewUrl || null;
  } catch (err) {
    console.error("Failed to send via Ethereal:", err);
    return null;
  }
}
