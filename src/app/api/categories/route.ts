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

// GET all categories with subcategories
export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        subcategories: {
          orderBy: { order: 'asc' },
        },
      },
    })
    return NextResponse.json(categories, { headers })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500, headers }
    )
  }
}

// POST create a category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { slug, titleFa, titleEn, descriptionFa, descriptionEn, coverImage, videoUrl, order } = body

    if (!slug || !titleFa || !titleEn) {
      return NextResponse.json(
        { error: 'slug, titleFa, and titleEn are required' },
        { status: 400, headers }
      )
    }

    const category = await db.category.create({
      data: {
        slug,
        titleFa,
        titleEn,
        descriptionFa,
        descriptionEn,
        coverImage,
        videoUrl,
        order: order ?? 0,
      },
    })

    return NextResponse.json(category, { status: 201, headers })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500, headers }
    )
  }
}

// PUT update a category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400, headers }
      )
    }

    const category = await db.category.update({
      where: { id },
      data,
    })

    return NextResponse.json(category, { headers })
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500, headers }
    )
  }
}

// DELETE a category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id query parameter is required' },
        { status: 400, headers }
      )
    }

    await db.category.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { headers }
    )
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500, headers }
    )
  }
}
