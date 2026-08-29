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

// GET single project by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const project = await db.project.findUnique({
      where: { id },
      include: {
        category: true,
        subcategory: true,
        images: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404, headers }
      )
    }

    return NextResponse.json(project, { headers })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500, headers }
    )
  }
}

// PUT update a project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { images, ...data } = body

    // Update project fields
    const project = await db.project.update({
      where: { id },
      data,
      include: {
        images: { orderBy: { order: 'asc' } },
      },
    })

    // If images array is provided, replace all images
    if (images !== undefined) {
      // Delete existing images
      await db.projectImage.deleteMany({ where: { projectId: id } })

      // Create new images
      if (images.length > 0) {
        await db.projectImage.createMany({
          data: images.map(
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
              projectId: id,
            })
          ),
        })
      }

      // Return updated project with fresh images
      const updatedProject = await db.project.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          images: { orderBy: { order: 'asc' } },
        },
      })

      return NextResponse.json(updatedProject, { headers })
    }

    return NextResponse.json(project, { headers })
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500, headers }
    )
  }
}

// DELETE a project
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await db.project.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { headers }
    )
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500, headers }
    )
  }
}
