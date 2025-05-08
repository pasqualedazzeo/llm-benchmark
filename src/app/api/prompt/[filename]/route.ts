import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const promptsDirectory = path.join(process.cwd(), 'prompts');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  try {
    // Basic security: Prevent directory traversal
    if (filename.includes('..')) {
      return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = path.join(promptsDirectory, filename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return NextResponse.json({ content: fileContent });
  } catch (error) {
    console.error(`Failed to read prompt file ${filename}:`, error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to read prompt' },
      { status: 500 }
    );
  }
}
