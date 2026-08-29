import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile, stat, readdir } from 'fs/promises';
import path from 'path';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}

/* Allowed directories for patching (security) */
const ALLOWED_DIRS = ['src', 'prisma', 'public'];

function isPathAllowed(filePath: string): boolean {
  const resolved = path.resolve(process.cwd(), filePath);
  const cwd = process.cwd();
  if (!resolved.startsWith(cwd)) return false;
  const relative = path.relative(cwd, resolved);
  const firstDir = relative.split(path.sep)[0];
  return ALLOWED_DIRS.includes(firstDir);
}

function isSensitiveFile(filePath: string): boolean {
  const sensitive = ['.env', 'db/custom.db', 'db/custom.db-journal'];
  return sensitive.some(s => filePath.includes(s));
}

/* ───── POST: Apply a patch (find & replace in a file) ───── */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filePath, searchCode, replaceCode, action } = body;

    // action: 'preview' (dry run) or 'apply'
    const isPreview = action === 'preview';

    if (!filePath || !searchCode) {
      return NextResponse.json({ error: 'filePath and searchCode are required' }, { status: 400, headers });
    }

    // Security checks
    if (!isPathAllowed(filePath)) {
      return NextResponse.json({ error: 'Access denied: file outside allowed directories' }, { status: 403, headers });
    }

    if (isSensitiveFile(filePath)) {
      return NextResponse.json({ error: 'Cannot patch sensitive files (.env, database)' }, { status: 403, headers });
    }

    const fullPath = path.resolve(process.cwd(), filePath);

    // Check file exists
    let fileContent: string;
    try {
      fileContent = await readFile(fullPath, 'utf-8');
    } catch {
      return NextResponse.json({ error: `File not found: ${filePath}` }, { status: 404, headers });
    }

    // Find occurrences
    const occurrences: number[] = [];
    let searchPos = 0;
    while (true) {
      const idx = fileContent.indexOf(searchCode, searchPos);
      if (idx === -1) break;
      occurrences.push(idx);
      searchPos = idx + 1;
    }

    if (occurrences.length === 0) {
      return NextResponse.json({
        found: false,
        count: 0,
        message: 'Pattern not found in file',
        preview: null,
      }, { headers });
    }

    // Build preview (show context around first match)
    const firstIdx = occurrences[0];
    const contextStart = Math.max(0, firstIdx - 80);
    const contextEnd = Math.min(fileContent.length, firstIdx + searchCode.length + 80);
    const before = fileContent.slice(contextStart, firstIdx);
    const matched = fileContent.slice(firstIdx, firstIdx + searchCode.length);
    const after = fileContent.slice(firstIdx + searchCode.length, contextEnd);

    if (isPreview) {
      return NextResponse.json({
        found: true,
        count: occurrences.length,
        message: `Found ${occurrences.length} occurrence(s) — preview mode, no changes made`,
        preview: {
          filePath,
          before,
          matched,
          after,
          totalLines: fileContent.split('\n').length,
          matchedLineStart: fileContent.slice(0, firstIdx).split('\n').length + 1,
        },
      }, { headers });
    }

    // Apply: replace all occurrences
    const newContent = fileContent.replaceAll(searchCode, replaceCode);
    await writeFile(fullPath, newContent, 'utf-8');

    const s = await stat(fullPath);

    return NextResponse.json({
      found: true,
      count: occurrences.length,
      message: `Successfully patched ${occurrences.length} occurrence(s) in ${filePath}`,
      preview: {
        filePath,
        before,
        matched,
        after,
        totalLines: fileContent.split('\n').length,
        matchedLineStart: fileContent.slice(0, firstIdx).split('\n').length + 1,
      },
      appliedAt: new Date().toISOString(),
      fileSize: s.size,
    }, { headers });
  } catch (error) {
    console.error('Patch error:', error);
    return NextResponse.json(
      { error: 'Patch failed: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500, headers }
    );
  }
}

/* ───── GET: List patchable files for convenience ───── */
export async function GET() {
  try {
    const fileList: { path: string; size: number }[] = [];

    async function walk(dir: string, base: string) {
      const entries = await readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const fullPath = path.join(dir, entry.name);
        const relPath = path.join(base, entry.name);
        if (entry.isDirectory()) {
          await walk(fullPath, relPath);
        } else {
          const ext = path.extname(entry.name);
          if (['.tsx', '.ts', '.jsx', '.js', '.css', '.json', '.prisma', '.md', '.html'].includes(ext)) {
            const s = await stat(fullPath);
            fileList.push({ path: relPath, size: s.size });
          }
        }
      }
    }

    for (const dir of ALLOWED_DIRS) {
      const dirPath = path.join(process.cwd(), dir);
      try {
        await walk(dirPath, dir);
      } catch {
        // directory might not exist
      }
    }

    return NextResponse.json({ files: fileList, count: fileList.length }, { headers });
  } catch (error) {
    console.error('File list error:', error);
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500, headers });
  }
}
