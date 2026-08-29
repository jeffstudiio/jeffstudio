import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, code } = await request.json()
    if (!sessionId || !code) {
      return NextResponse.json({ error: 'MISSING_PARAMS' }, { status: 400 })
    }
    const result = verifyOTP(sessionId, code)
    if (result.valid) {
      return NextResponse.json({ success: true })
    }
    const statusMap: Record<string, number> = {
      CODE_EXPIRED: 410,
      MAX_ATTEMPTS: 429,
      WRONG_CODE: 401,
    }
    const errKey = result.error || ''
    return NextResponse.json(
      { error: result.error },
      { status: statusMap[errKey] || 401 }
    )
  } catch (err) {
    console.error('Verify OTP error:', err)
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
