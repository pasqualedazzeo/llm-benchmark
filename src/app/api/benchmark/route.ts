import { NextRequest, NextResponse } from 'next/server';

const PYTHON_BENCHMARK_URL = 'http://127.0.0.1:5371/benchmark_py'; // Ensure this matches your Python service URL and port

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
    const pythonServiceResponse = await fetch(PYTHON_BENCHMARK_URL, {
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
