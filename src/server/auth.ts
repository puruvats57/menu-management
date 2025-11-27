import { db } from "~/server/db";
import { nanoid } from "nanoid";
import { Resend } from "resend";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

export async function generateVerificationCode(email: string): Promise<string> {
  // Clean up old codes for this email first
  await db.verificationCode.deleteMany({
    where: { email },
  });

  // Generate a 6-digit code (ensuring it's always 6 digits)
  const code = Math.floor(100000 + Math.random() * 900000).toString().padStart(6, "0");

  // Store the code in the database with 10-minute expiration
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await db.verificationCode.create({
    data: {
      email: email.toLowerCase().trim(),
      code,
      expiresAt,
    },
  });

  // Send email with verification code
  try {
    await resend.emails.send({
      from: "Menu Management <onboarding@resend.dev>",
      to: email,
      subject: "Your Verification Code",
      html: `
        <h2>Your Verification Code</h2>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
      `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    // Don't throw - code is still created in DB for testing
  }

  return code;
}

export async function verifyCode(email: string, code: string): Promise<boolean> {
  // Clean up expired codes first
  await db.verificationCode.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });

  // Normalize the code (remove any whitespace, ensure it's a string)
  const normalizedCode = code.trim();

  const verification = await db.verificationCode.findFirst({
    where: {
      email: email.toLowerCase().trim(),
      code: normalizedCode,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!verification) {
    return false;
  }

  // Delete the used code (and any other codes for this email)
  await db.verificationCode.deleteMany({
    where: {
      email: email.toLowerCase().trim(),
    },
  });

  return true;
}

export async function createSession(userId: string): Promise<string> {
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await db.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return token;
}

export async function getSession(token: string) {
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  return session;
}

export async function deleteSession(token: string) {
  await db.session.deleteMany({
    where: { token },
  });
}

