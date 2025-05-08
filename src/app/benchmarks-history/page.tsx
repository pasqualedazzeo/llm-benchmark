'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BenchmarkHistoryFile {
  name: string;
}

interface BenchmarkData {
  promptContent: string;
  llm1: string;
  llm2: string;
  results: {
    llm1?: { model: string; response?: string; error?: string };
    llm2?: { model: string; response?: string; error?: string };
  };
  timestamp: string;
}

export default function BenchmarkHistoryPage() {
  const [historyFiles, setHistoryFiles] = useState<BenchmarkHistoryFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkData | null>(null);
  const [selectedBenchmarkFilename, setSelectedBenchmarkFilename] = useState<string | null>(null); // To track which item's details are being loaded
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchHistoryFiles();
  }, []);

  const fetchHistoryFiles = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/benchmarks-history');
      if (!response.ok) {
        throw new Error(`Failed to fetch benchmark history: ${response.statusText}`);
      }
      const data: string[] = await response.json();
      setHistoryFiles(data.map(name => ({ name })));
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = async (filename: string) => {
    setSelectedBenchmarkFilename(filename); // Keep track of which file is being loaded
    setIsFetchingDetails(true);
    setError(null);
    // setSelectedBenchmark(null); // Clear previous selection immediately if preferred
    try {
      const response = await fetch(`/api/benchmarks-history/${encodeURIComponent(filename)}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to fetch details for ${filename}`);
      }
      const data: BenchmarkData = await response.json();
      setSelectedBenchmark(data);
      setIsDialogOpen(true);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
      setSelectedBenchmark(null); // Clear on error
    } finally {
      setIsFetchingDetails(false);
    }
  };

  if (isLoading) return <p className="p-4">Loading benchmark history...</p>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Benchmark History</h1>
        {/* Removed old Link component */}
      </div>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded dark:bg-red-900 dark:text-red-200">Error: {error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Saved Benchmarks</CardTitle>
          <CardDescription>Review your past benchmark runs. Click on an item to view details.</CardDescription>
        </CardHeader>
        <CardContent>
          {historyFiles.length === 0 && !isLoading && (
            <p>No benchmark history found. Run some benchmarks to see them here!</p>
          )}
          {historyFiles.length > 0 && (
            <ul className="space-y-3">
              {historyFiles.map((file) => (
                <li key={file.name} className="flex justify-between items-center p-3 border rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700">
                  <span>{file.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewDetails(file.name)}
                    disabled={isFetchingDetails && selectedBenchmarkFilename === file.name}
                  >
                    {(isFetchingDetails && selectedBenchmarkFilename === file.name) ? 'Loading...' : 'View Details'}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {selectedBenchmark && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Benchmark Details: {selectedBenchmarkFilename}</DialogTitle>
              <DialogDescription>
                Ran on: {new Date(selectedBenchmark.timestamp).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-grow p-1 border rounded-md dark:border-slate-700 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 py-4 px-2">
                    <Card className="dark:bg-slate-850">
                        <CardHeader><CardTitle>Prompt</CardTitle></CardHeader>
                        <CardContent className="prose prose-sm max-w-none dark:prose-invert p-4 rounded-md bg-slate-50 dark:bg-slate-900">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                {selectedBenchmark.promptContent}
                            </ReactMarkdown>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {[selectedBenchmark.results.llm1, selectedBenchmark.results.llm2].map((res, index) => res && (
                            <Card key={index} className="dark:bg-slate-850">
                                <CardHeader>
                                    <CardTitle>{res.model || (index === 0 ? selectedBenchmark.llm1 : selectedBenchmark.llm2)}</CardTitle>
                                </CardHeader>
                                <CardContent className="prose prose-sm max-w-none dark:prose-invert p-4 rounded-md bg-slate-50 dark:bg-slate-900 min-h-[100px]">
                                    {res.error ? (
                                        <p className="text-red-500">Error: {res.error}</p>
                                    ) : (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                                            {res.response || "No response recorded."}
                                        </ReactMarkdown>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </ScrollArea>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
