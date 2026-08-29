import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers })
}

// GET all settings as a key-value object
export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()

    const settingsMap: Record<string, string> = {}
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value
    }

    return NextResponse.json(settingsMap, { headers })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500, headers }
    )
  }
}

// PUT update settings
// Accepts either { key, value } for a single setting
// or { settings: [{ key, value }] } for batch updates
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.settings && Array.isArray(body.settings)) {
      // Batch update
      const results = []
      for (const item of body.settings) {
        const { key, value } = item
        if (!key) continue

        const result = await db.siteSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value: value ?? '' },
        })
        results.push(result)
      }
      return NextResponse.json(results, { headers })
    } else {
      // Single update
      const { key, value } = body

      if (!key) {
        return NextResponse.json(
          { error: 'key is required' },
          { status: 400, headers }
        )
      }

      const setting = await db.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value: value ?? '' },
      })

      return NextResponse.json(setting, { headers })
    }
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500, headers }
    )
  }
}
