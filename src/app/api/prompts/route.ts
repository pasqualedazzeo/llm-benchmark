import { NextResponse, NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const promptsDirectory = path.join(process.cwd(), 'prompts');

export async function GET() {
  try {
    const files = await fs.readdir(promptsDirectory);
    // Optionally, filter for specific file extensions, e.g., .md, .txt
    const promptFiles = files.filter(
      (file) => file.endsWith('.md') || file.endsWith('.txt')
    );
    return NextResponse.json(promptFiles);
  } catch (error) {
    console.error('Failed to read prompts directory:', error);
    // Check if the error is because the directory doesn't exist
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      // If the directory doesn't exist, return an empty array, as it's not a critical server error.
      return NextResponse.json([]);
    }
    return NextResponse.json(
      { error: 'Failed to list prompts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { filename, content } = body;

    if (!filename || typeof filename !== 'string' || !content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Filename and content are required and must be strings.' },
        { status: 400 }
      );
    }

    // Sanitize filename to prevent directory traversal and ensure valid extension
    const sanitizedFilename = path.basename(filename);
    if (!sanitizedFilename.endsWith('.md') && !sanitizedFilename.endsWith('.txt')) {
      return NextResponse.json(
        { error: 'Invalid file extension. Only .md and .txt are allowed.' },
        { status: 400 }
      );
    }

    if (sanitizedFilename !== filename) {
        return NextResponse.json(
            { error: 'Invalid filename. Filename cannot contain path characters.' },
            { status: 400 }
        );
    }

    // Ensure prompts directory exists (optional, could rely on it existing)
    // For simplicity, we'll assume it exists as per current GET logic and setup.
    // If not, fs.mkdir(promptsDirectory, { recursive: true }) could be added.

    const filePath = path.join(promptsDirectory, sanitizedFilename);
    await fs.writeFile(filePath, content);

    return NextResponse.json(
      { message: 'Prompt created successfully', filename: sanitizedFilename },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create prompt:', error);
    if (error instanceof SyntaxError) { // JSON parsing error
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create prompt' },
      { status: 500 }
    );
  }
}
