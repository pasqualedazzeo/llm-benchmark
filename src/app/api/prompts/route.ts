import { NextResponse } from 'next/server';
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
