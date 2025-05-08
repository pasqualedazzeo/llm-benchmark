import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Correctly points to the directory where benchmark JSON files are stored
const actualBenchmarksStorageDir = path.join(process.cwd(), 'benchmarks_history'); 

export async function GET() {
  try {
    // Check if the actual storage directory exists
    try {
      await fs.access(actualBenchmarksStorageDir);
    } catch (dirError: any) {
      if (dirError.code === 'ENOENT') {
        // If directory doesn't exist, it means no history, return empty array
        console.log(`Benchmark history directory not found: ${actualBenchmarksStorageDir}. Returning empty list.`);
        return NextResponse.json([]);
      }
      throw dirError; // Re-throw other access errors
    }

    const files = await fs.readdir(actualBenchmarksStorageDir);
    const benchmarkFiles = files
      .filter((file) => file.endsWith('.json'))
      .sort((a, b) => b.localeCompare(a)); // Sort by name, newest first
      
    return NextResponse.json(benchmarkFiles);
  } catch (error) {
    console.error('Failed to list benchmark history:', error);
    return NextResponse.json(
      { error: 'Failed to list benchmark history' },
      { status: 500 }
    );
  }
}
