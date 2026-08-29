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

// POST create a subcategory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { categoryId, slug, titleFa, titleEn, order } = body

    if (!categoryId || !slug || !titleFa || !titleEn) {
      return NextResponse.json(
        { error: 'categoryId, slug, titleFa, and titleEn are required' },
        { status: 400, headers }
      )
    }

    const sub = await db.subCategory.create({
      data: { categoryId, slug, titleFa, titleEn, order: order ?? 0 },
    })
    return NextResponse.json(sub, { status: 201, headers })
  } catch (error) {
    console.error('Error creating subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to create subcategory' },
      { status: 500, headers }
    )
  }
}

// PUT update a subcategory
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400, headers })
    }
    const sub = await db.subCategory.update({ where: { id }, data })
    return NextResponse.json(sub, { headers })
  } catch (error) {
    console.error('Error updating subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to update subcategory' },
      { status: 500, headers }
    )
  }
}

// DELETE a subcategory
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400, headers })
    }
    await db.subCategory.delete({ where: { id } })
    return NextResponse.json({ message: 'Subcategory deleted' }, { headers })
  } catch (error) {
    console.error('Error deleting subcategory:', error)
    return NextResponse.json(
      { error: 'Failed to delete subcategory' },
      { status: 500, headers }
    )
  }
}
