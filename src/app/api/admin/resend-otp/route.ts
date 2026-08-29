import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@jeffstudio.ir'

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json({ error: 'MISSING_PARAMS' }, { status: 400 })
    }
    const otp = generateOTP()
    storeOTP(sessionId, otp)
    const emailResult = await sendOTPEmail(ADMIN_EMAIL, otp)
    if (!emailResult.success) {
      return NextResponse.json({ error: 'EMAIL_SEND_FAILED' }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Resend OTP error:', err)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
