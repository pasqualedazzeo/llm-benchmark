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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { promptContent, results, promptName } = data;
    
    // Extract model names from results
    const llm1 = results.llm1?.model || '';
    const llm2 = results.llm2?.model || '';
    
    // Ensure the directory exists
    try {
      await fs.access(actualBenchmarksStorageDir);
    } catch (dirError: any) {
      if (dirError.code === 'ENOENT') {
        await fs.mkdir(actualBenchmarksStorageDir, { recursive: true });
      } else {
        throw dirError;
      }
    }
    
    // Create timestamp for filename and data
    const timestamp = new Date().toISOString();
    const formattedDate = timestamp.replace(/:/g, '-').replace(/\..+/, '');
    
    // Generate a descriptive filename with model names
    const modelPart1 = llm1.replace(/\//g, '_');
    const modelPart2 = llm2.replace(/\//g, '_');
    const filename = `benchmark_${formattedDate}_${modelPart1}_vs_${modelPart2}.json`;
    
    // Prepare the data to save
    const benchmarkData = {
      promptContent,
      llm1,
      llm2,
      results,
      timestamp
    };
    
    // Save the benchmark data to a file
    const filePath = path.join(actualBenchmarksStorageDir, filename);
    await fs.writeFile(filePath, JSON.stringify(benchmarkData, null, 2));
    
    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error('Failed to save benchmark history:', error);
    return NextResponse.json(
      { error: 'Failed to save benchmark history' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Check if the directory exists first
    try {
      await fs.access(actualBenchmarksStorageDir);
    } catch (dirError: any) {
      if (dirError.code === 'ENOENT') {
        // If directory doesn't exist, nothing to delete
        return NextResponse.json({ success: true, message: 'No benchmark history to clear' });
      }
      throw dirError;
    }

    // Get all JSON files in the directory
    const files = await fs.readdir(actualBenchmarksStorageDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Delete each JSON file
    const deletePromises = jsonFiles.map(file => 
      fs.unlink(path.join(actualBenchmarksStorageDir, file))
    );
    
    await Promise.all(deletePromises);
    
    return NextResponse.json({ 
      success: true, 
      message: `Successfully cleared ${jsonFiles.length} benchmark history files` 
    });
  } catch (error) {
    console.error('Failed to clear benchmark history:', error);
    return NextResponse.json(
      { error: 'Failed to clear benchmark history' },
      { status: 500 }
    );
  }
}
