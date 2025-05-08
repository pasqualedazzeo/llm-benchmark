import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const actualBenchmarksStorageDir = path.join(process.cwd(), 'benchmarks_history');

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  const { filename } = params;

  if (!filename) {
    return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
  }

  // Security: Sanitize filename to prevent directory traversal and ensure it's just the base name
  const sanitizedFilename = path.basename(filename);
  if (sanitizedFilename !== filename || !sanitizedFilename.endsWith('.json')) {
    return NextResponse.json({ error: 'Invalid or non-JSON filename' }, { status: 400 });
  }

  try {
    const filePath = path.join(actualBenchmarksStorageDir, sanitizedFilename);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const jsonData = JSON.parse(fileContent); // Ensure it's valid JSON
    return NextResponse.json(jsonData);
  } catch (error: any) {
    console.error(`Failed to read benchmark history file ${sanitizedFilename}:`, error);
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'Benchmark history file not found' }, { status: 404 });
    } else if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON content in benchmark file' }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'Failed to read benchmark history file' },
      { status: 500 }
    );
  }
}
