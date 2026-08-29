import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'jeff2024'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@jeffstudio.ir'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'INVALID_PASSWORD' }, { status: 401 })
    }
    const sessionId = crypto.randomUUID()
    const otp = generateOTP()
    storeOTP(sessionId, otp)
    const emailResult = await sendOTPEmail(ADMIN_EMAIL, otp)
    if (!emailResult.success) {
      // In dev mode, still proceed even if email "fails"
      return NextResponse.json({ success: true, sessionId })
    }
    return NextResponse.json({ success: true, sessionId })
  } catch (err) {
    console.error('Send OTP error:', err)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
