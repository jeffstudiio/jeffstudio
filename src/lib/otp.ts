// In-memory OTP store (resets on server restart — fine for single-instance)
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;

/** Generate a random numeric OTP */
export function generateOTP(): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/** Store OTP for a session */
export function storeOTP(sessionId: string, code: string): void {
  const now = Date.now();
  for (const [key, val] of otpStore.entries()) {
    if (val.expiresAt < now) otpStore.delete(key);
  }
  otpStore.set(sessionId, {
    code,
    expiresAt: now + OTP_TTL_MS,
    attempts: 0,
  });
}

/** Verify OTP for a session */
export function verifyOTP(sessionId: string, inputCode: string): { valid: boolean; error?: string } {
  const entry = otpStore.get(sessionId);
  if (!entry) return { valid: false, error: 'CODE_EXPIRED' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(sessionId);
    return { valid: false, error: 'CODE_EXPIRED' };
  }
  entry.attempts++;
  if (entry.attempts > MAX_ATTEMPTS) {
    otpStore.delete(sessionId);
    return { valid: false, error: 'MAX_ATTEMPTS' };
  }
  if (entry.code !== inputCode) return { valid: false, error: 'WRONG_CODE' };
  otpStore.delete(sessionId);
  return { valid: true };
}

/** Send OTP via email using Resend (or log to console in dev) */
export async function sendOTPEmail(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log('========================================');
    console.log(`  [DEV MODE] OTP for ${email}: ${otp}`);
    console.log('========================================');
    return { success: true };
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(resendApiKey);
    const result = await resend.emails.send({
      from: 'JEFF Studio <onboarding@resend.dev>',
      to: [email],
      subject: 'کد تایید ورود به پنل مدیریت | JEFF Studio Admin OTP',
      html: `
        <div style="font-family: Tahoma, Arial, sans-serif; direction: rtl; max-width: 400px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #1a1a1a; margin: 0;">JEFF Studio</h2>
            <p style="color: #666; margin: 8px 0 0;">کد تایید ورود به پنل مدیریت</p>
          </div>
          <div style="background: #f5f5f5; border-radius: 12px; padding: 24px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1a1a1a; direction: ltr;">${otp}</span>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 16px;">
            این کد تا ۵ دقیقه معتبر است. اگر شما این درخواست را نداده‌اید، این پیام را نادیده بگیرید.
          </p>
        </div>
      `,
    });
    if (result.error) {
      console.error('Resend error:', result.error);
      return { success: false, error: 'EMAIL_SEND_FAILED' };
    }
    return { success: true };
  } catch (err) {
    console.error('Failed to send OTP email:', err);
    return { success: false, error: 'EMAIL_SEND_FAILED' };
  }
}
