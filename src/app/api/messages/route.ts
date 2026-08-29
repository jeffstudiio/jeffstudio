import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers })
}

// GET all messages (newest first)
export async function GET() {
  try {
    const messages = await db.message.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(messages, { headers })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500, headers }
    )
  }
}

// POST new message (from contact form)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, message, serviceIndex } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'name, email, and message are required' },
        { status: 400, headers }
      )
    }

    const msg = await db.message.create({
      data: {
        name,
        email,
        phone: phone || '',
        message,
        serviceIndex: serviceIndex ?? null,
      },
    })

    return NextResponse.json(msg, { status: 201, headers })
  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500, headers }
    )
  }
}

// DELETE a message
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400, headers }
      )
    }

    await db.message.delete({ where: { id } })

    return NextResponse.json(
      { message: 'Message deleted' },
      { headers }
    )
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500, headers }
    )
  }
}
