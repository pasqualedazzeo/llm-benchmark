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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Sanitize filename to prevent directory traversal and ensure it's just the base name
  const sanitizedFilename = path.basename(filename);
  if (sanitizedFilename !== filename) {
    return NextResponse.json({ error: 'Invalid filename. Filename cannot contain path characters.' }, { status: 400 });
  }
  if (!sanitizedFilename.endsWith('.md') && !sanitizedFilename.endsWith('.txt')) {
    return NextResponse.json(
      { error: 'Invalid file extension. Only .md and .txt are allowed.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { content } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string.' },
        { status: 400 }
      );
    }

    const filePath = path.join(promptsDirectory, sanitizedFilename);
    
    // Check if file exists before attempting to write (optional, writeFile will overwrite or create)
    // For an update, we might want to ensure it exists first.
    try {
      await fs.access(filePath);
    } catch (e) {
      return NextResponse.json({ error: 'Prompt not found for update' }, { status: 404 });
    }

    await fs.writeFile(filePath, content);
    return NextResponse.json({ message: 'Prompt updated successfully', filename: sanitizedFilename });

  } catch (error) {
    console.error(`Failed to update prompt file ${sanitizedFilename}:`, error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update prompt' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest, // request is not used but good to keep for consistency
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Sanitize filename
  const sanitizedFilename = path.basename(filename);
  if (sanitizedFilename !== filename) {
    return NextResponse.json({ error: 'Invalid filename. Filename cannot contain path characters.' }, { status: 400 });
  }
  if (!sanitizedFilename.endsWith('.md') && !sanitizedFilename.endsWith('.txt')) {
    return NextResponse.json(
      { error: 'Invalid file extension. Only .md and .txt are allowed for deletion.' },
      { status: 400 }
    );
  }

  try {
    const filePath = path.join(promptsDirectory, sanitizedFilename);
    await fs.unlink(filePath);
    return NextResponse.json({ message: 'Prompt deleted successfully', filename: sanitizedFilename });
  } catch (error) {
    console.error(`Failed to delete prompt file ${sanitizedFilename}:`, error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Prompt not found for deletion' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete prompt' },
      { status: 500 }
    );
  }
}
