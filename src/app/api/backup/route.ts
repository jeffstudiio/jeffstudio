import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { readdir, readFile, stat } from 'fs/promises';
import path from 'path';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}

/* ───── GET: Export all DB data as JSON ───── */
export async function GET() {
  try {
    const [categories, subcategories, projects, projectImages, services, settings, aboutInfo, contactInfo, messages] =
      await Promise.all([
        db.category.findMany({ orderBy: { order: 'asc' } }),
        db.subCategory.findMany({ orderBy: { order: 'asc' } }),
        db.project.findMany({ orderBy: { order: 'asc' } }),
        db.projectImage.findMany({ orderBy: { order: 'asc' } }),
        db.service.findMany({ orderBy: { order: 'asc' } }),
        db.siteSetting.findMany(),
        db.aboutInfo.findFirst(),
        db.contactInfo.findFirst(),
        db.message.findMany({ orderBy: { createdAt: 'desc' } }),
      ]);

    // Collect uploaded files info
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    let uploadedFiles: { path: string; size: number }[] = [];
    try {
      const walk = async (dir: string, base: string) => {
        const entries = await readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.join(base, entry.name);
          if (entry.isDirectory()) {
            await walk(fullPath, relPath);
          } else {
            const s = await stat(fullPath);
            uploadedFiles.push({ path: relPath, size: s.size });
          }
        }
      };
      await walk(uploadsDir, 'uploads');
    } catch {
      // uploads dir might not exist
    }

    const backup = {
      version: '4.0',
      exportedAt: new Date().toISOString(),
      data: {
        categories,
        subcategories,
        projects,
        projectImages,
        services,
        settings,
        aboutInfo,
        contactInfo,
        messages,
      },
      uploadedFiles,
    };

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="jeff-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json({ error: 'Backup failed' }, { status: 500, headers });
  }
}

/* ───── POST: Import (restore) DB data from JSON ───── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { data, mode } = body;

    if (!data) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400, headers });
    }

    // mode: 'replace' = clear all then import, 'merge' = only add new
    const isReplace = mode === 'replace';

    if (isReplace) {
      // Delete in correct order (respect FK constraints)
      await db.projectImage.deleteMany();
      await db.message.deleteMany();
      await db.project.deleteMany();
      await db.subCategory.deleteMany();
      await db.category.deleteMany();
      await db.service.deleteMany();
      await db.siteSetting.deleteMany();
      await db.aboutInfo.deleteMany();
      await db.contactInfo.deleteMany();
    }

    const results: { table: string; count: number }[] = [];

    // Settings
    if (data.settings?.length) {
      for (const s of data.settings) {
        if (isReplace) {
          await db.siteSetting.create({ data: { key: s.key, value: s.value } });
        } else {
          await db.siteSetting.upsert({
            where: { key: s.key },
            update: { value: s.value },
            create: { key: s.key, value: s.value },
          });
        }
      }
      results.push({ table: 'settings', count: data.settings.length });
    }

    // About Info
    if (data.aboutInfo) {
      if (isReplace) {
        await db.aboutInfo.create({ data: data.aboutInfo });
      } else {
        const existing = await db.aboutInfo.findFirst();
        if (existing) {
          const { id, updatedAt, ...rest } = data.aboutInfo;
          await db.aboutInfo.update({ where: { id: existing.id }, data: rest });
        } else {
          await db.aboutInfo.create({ data: data.aboutInfo });
        }
      }
      results.push({ table: 'aboutInfo', count: 1 });
    }

    // Contact Info
    if (data.contactInfo) {
      if (isReplace) {
        await db.contactInfo.create({ data: data.contactInfo });
      } else {
        const existing = await db.contactInfo.findFirst();
        if (existing) {
          const { id, updatedAt, ...rest } = data.contactInfo;
          await db.contactInfo.update({ where: { id: existing.id }, data: rest });
        } else {
          await db.contactInfo.create({ data: data.contactInfo });
        }
      }
      results.push({ table: 'contactInfo', count: 1 });
    }

    // Categories
    if (data.categories?.length) {
      const catIdMap = new Map<string, string>(); // old id -> new id
      for (const cat of data.categories) {
        const oldId = cat.id;
        const { id, updatedAt, createdAt, subcategories, projects, ...rest } = cat;
        const newCat = await db.category.create({ data: rest as any });
        catIdMap.set(oldId, newCat.id);
      }
      results.push({ table: 'categories', count: data.categories.length });

      // Subcategories
      if (data.subcategories?.length) {
        const subIdMap = new Map<string, string>();
        for (const sub of data.subcategories) {
          const oldId = sub.id;
          const { id, updatedAt, createdAt, projects, ...rest } = sub;
          const newCatId = catIdMap.get(sub.categoryId) || sub.categoryId;
          const newSub = await db.subCategory.create({ data: { ...rest, categoryId: newCatId } as any });
          subIdMap.set(oldId, newSub.id);
        }
        results.push({ table: 'subcategories', count: data.subcategories.length });

        // Projects
        if (data.projects?.length) {
          const projIdMap = new Map<string, string>();
          for (const proj of data.projects) {
            const oldId = proj.id;
            const { id, updatedAt, createdAt, images, category, subcategory, ...rest } = proj;
            const newCatId = catIdMap.get(proj.categoryId) || proj.categoryId;
            const newSubId = proj.subcategoryId ? (subIdMap.get(proj.subcategoryId) || proj.subcategoryId) : null;
            const newProj = await db.project.create({ data: { ...rest, categoryId: newCatId, subcategoryId: newSubId } as any });
            projIdMap.set(oldId, newProj.id);
          }
          results.push({ table: 'projects', count: data.projects.length });

          // Project Images
          if (data.projectImages?.length) {
            for (const img of data.projectImages) {
              const { id, createdAt, ...rest } = img;
              const newProjId = projIdMap.get(img.projectId) || img.projectId;
              await db.projectImage.create({ data: { ...rest, projectId: newProjId } as any });
            }
            results.push({ table: 'projectImages', count: data.projectImages.length });
          }
        }
      }
    }

    // Services (independent table)
    if (data.services?.length) {
      if (isReplace) {
        await db.service.deleteMany();
      }
      for (const svc of data.services) {
        const { id, updatedAt, createdAt, ...rest } = svc;
        await db.service.create({ data: rest as any });
      }
      results.push({ table: 'services', count: data.services.length });
    }

    // Messages (usually not restored, but support it)
    if (data.messages?.length && isReplace) {
      for (const msg of data.messages) {
        const { id, createdAt, ...rest } = msg;
        await db.message.create({ data: rest as any });
      }
      results.push({ table: 'messages', count: data.messages.length });
    }

    return NextResponse.json({
      success: true,
      message: isReplace ? 'Backup restored (replace mode)' : 'Backup merged successfully',
      results,
    }, { headers });
  } catch (error) {
    console.error('Backup import error:', error);
    return NextResponse.json(
      { error: 'Restore failed: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500, headers }
    );
  }
}
