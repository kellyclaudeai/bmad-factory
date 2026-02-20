import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const PROJECTS_ROOT = process.env.PROJECTS_ROOT || '/Users/austenallred/clawd/projects';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const file = searchParams.get('file');

  if (!projectId || !file) {
    return NextResponse.json({ error: 'Missing projectId or file' }, { status: 400 });
  }

  // Prevent path traversal
  const normalizedFile = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '');
  const imagePath = path.join(
    PROJECTS_ROOT,
    projectId,
    '_bmad-output',
    'design-assets',
    'images',
    normalizedFile
  );

  if (!fs.existsSync(imagePath)) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 });
  }

  const ext = path.extname(imagePath).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';

  const buffer = fs.readFileSync(imagePath);
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
