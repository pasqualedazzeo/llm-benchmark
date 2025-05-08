import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const pythonApiUrl = process.env.PYTHON_API_URL || 'http://127.0.0.1:5371'; // Fallback for local dev without Docker
const benchmarksHistoryDir = path.join(process.cwd(), 'benchmarks_history');

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { promptContent, llm1, llm2 } = body;

    if (!promptContent || !llm1 || !llm2) {
      return NextResponse.json(
        { error: 'Missing promptContent, llm1, or llm2 in request body' },
        { status: 400 }
      );
    }

    // Forward the request to the Python benchmark service
    const pythonServiceResponse = await fetch(`${pythonApiUrl}/benchmark_py`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ promptContent, llm1, llm2 }),
    });

    if (!pythonServiceResponse.ok) {
      // Try to get error details from Python service response
      let errorDetails = 'Python service returned an error.';
      try {
        const errorResult = await pythonServiceResponse.json();
        errorDetails = errorResult.error || errorResult.details || errorDetails;
      } catch (e) {
        // Ignore if parsing error response fails, use generic message
      }
      console.error(`Error from Python benchmark service: ${pythonServiceResponse.status} ${pythonServiceResponse.statusText}`, errorDetails);
      return NextResponse.json(
        { error: 'Failed to get response from Python benchmark service', details: errorDetails },
        { status: pythonServiceResponse.status }
      );
    }

    const results = await pythonServiceResponse.json();

    // Save benchmark results to a file
    try {
      const timestamp = new Date();
      const dateStr = timestamp.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = timestamp.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
      
      // Sanitize model names for filename (replace slashes, etc.)
      const safeLlm1 = llm1.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeLlm2 = llm2.replace(/[^a-zA-Z0-9_-]/g, '_');
      
      const filename = `benchmark_${dateStr}_${timeStr}_${safeLlm1}_vs_${safeLlm2}.json`;
      const filePath = path.join(benchmarksHistoryDir, filename);

      const dataToSave = {
        promptContent,
        llm1,
        llm2,
        results,
        timestamp: timestamp.toISOString(),
      };

      await fs.writeFile(filePath, JSON.stringify(dataToSave, null, 2));
      console.log(`Benchmark results saved to ${filePath}`);
    } catch (saveError: any) {
      console.error('Failed to save benchmark results:', saveError);
      // Do not fail the response to the client if saving fails, just log it.
    }

    // The Python service now returns a structure like:
    // {
    //   "llm1": {"model": "openai/o3-mini", "response": "...", "error": null},
    //   "llm2": {"model": "openai/o4-mini", "response": "...", "error": null}
    // }
    // This structure is compatible with what the frontend expects.
    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Error in Next.js benchmark proxy endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process benchmark request via proxy', details: error.message },
      { status: 500 }
    );
  }
}
