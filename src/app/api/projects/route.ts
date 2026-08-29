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

// GET all published projects with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const subcategoryId = searchParams.get('subcategoryId')
    const all = searchParams.get('all') === 'true'

    const where: Record<string, unknown> = all ? {} : { status: 'published' }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (subcategoryId) {
      where.subcategoryId = subcategoryId
    }

    const projects = await db.project.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        category: {
          select: { id: true, slug: true, titleFa: true, titleEn: true },
        },
        subcategory: {
          select: { id: true, slug: true, titleFa: true, titleEn: true },
        },
        images: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json(projects, { headers })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500, headers }
    )
  }
}

// POST create a project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      slug,
      titleFa,
      titleEn,
      descriptionFa,
      descriptionEn,
      clientFa,
      clientEn,
      locationFa,
      locationEn,
      year,
      status,
      order,
      categoryId,
      subcategoryId,
      images,
    } = body

    if (!slug || !titleFa || !titleEn || !categoryId) {
      return NextResponse.json(
        { error: 'slug, titleFa, titleEn, and categoryId are required' },
        { status: 400, headers }
      )
    }

    const project = await db.project.create({
      data: {
        slug,
        titleFa,
        titleEn,
        descriptionFa,
        descriptionEn,
        clientFa,
        clientEn,
        locationFa,
        locationEn,
        year,
        status: status ?? 'published',
        order: order ?? 0,
        categoryId,
        subcategoryId,
        images: images
          ? {
              create: images.map(
                (img: {
                  url: string
                  altFa?: string
                  altEn?: string
                  isCover?: boolean
                  isVideo?: boolean
                  order?: number
                }) => ({
                  url: img.url,
                  altFa: img.altFa,
                  altEn: img.altEn,
                  isCover: img.isCover ?? false,
                  isVideo: img.isVideo ?? false,
                  order: img.order ?? 0,
                })
              ),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    })

    return NextResponse.json(project, { status: 201, headers })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500, headers }
    )
  }
}
