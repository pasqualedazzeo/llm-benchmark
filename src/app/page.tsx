"use client";

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BenchmarkResult {
  model: string;
  response?: string;
  error?: string;
}

export default function BenchmarkPage() {
  const [promptsList, setPromptsList] = useState<string[]>([]);
  const [selectedPromptFile, setSelectedPromptFile] = useState<string>("");
  const [promptContent, setPromptContent] = useState<string>("");
  const [llm1, setLlm1] = useState<string>("gpt-3.5-turbo");
  const [llm2, setLlm2] = useState<string>("claude-3-haiku-20240307");
  const [results, setResults] = useState<{
    llm1?: BenchmarkResult;
    llm2?: BenchmarkResult;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingPrompt, setIsFetchingPrompt] = useState<boolean>(false);
  const [fullResponseContent, setFullResponseContent] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await fetch('/api/prompts');
        if (!response.ok) {
          throw new Error('Failed to fetch prompts');
        }
        const data = await response.json();
        setPromptsList(data);
        if (data.length > 0 && !selectedPromptFile) {
          setSelectedPromptFile(data[0]);
        }
      } catch (error) {
        console.error("Error fetching prompts:", error);
      }
    };
    fetchPrompts();
  }, [selectedPromptFile]);

  useEffect(() => {
    if (selectedPromptFile) {
      const fetchPromptContent = async () => {
        setIsFetchingPrompt(true);
        setPromptContent(""); // Clear previous content
        try {
          const response = await fetch(`/api/prompt/${selectedPromptFile}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch prompt content for ${selectedPromptFile}`);
          }
          const data = await response.json();
          setPromptContent(data.content);
        } catch (error) {
          console.error("Error fetching prompt content:", error);
          setPromptContent("Error loading prompt content.");
        } finally {
          setIsFetchingPrompt(false);
        }
      };
      fetchPromptContent();
    }
  }, [selectedPromptFile]);

  const handleRunBenchmark = async () => {
    if (!promptContent || !llm1 || !llm2) {
      console.error("Prompt content or LLM models are not selected.");
      // Optionally: set an error message in the UI
      return;
    }
    console.log("Running benchmark with:", { promptContent, llm1, llm2 });
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch('/api/benchmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptContent,
          llm1,
          llm2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Benchmark API error response:", errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error: any) {
      console.error("Error running benchmark:", error);
      setResults({
        llm1: { model: llm1, error: error.message || "Failed to get response" },
        llm2: { model: llm2, error: error.message || "Failed to get response" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openResponseDialog = (content?: string) => {
    if (content) {
      setFullResponseContent(content);
      setIsDialogOpen(true);
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 font-[family-name:var(--font-geist-sans)] min-h-screen flex flex-col">
      <header className="mb-8 mt-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            LLM Benchmark Console
          </h1>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Select
                value={selectedPromptFile}
                onValueChange={setSelectedPromptFile}
                disabled={promptsList.length === 0 || isLoading || isFetchingPrompt}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a prompt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Prompts</SelectLabel>
                    {promptsList.length > 0 ? (
                      promptsList.map((prompt) => (
                        <SelectItem key={prompt} value={prompt}>
                          {prompt}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-prompts" disabled>
                        {isFetchingPrompt ? "Loading prompts..." : "No prompts found"}
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                placeholder="Enter LLM 1 (e.g., gpt-4o)"
                value={llm1}
                onChange={(e) => setLlm1(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div>
              <Input
                placeholder="Enter LLM 2 (e.g., claude-3-opus-20240229)"
                value={llm2}
                onChange={(e) => setLlm2(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleRunBenchmark}
              disabled={isLoading || isFetchingPrompt || !promptContent || !llm1 || !llm2}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3"
            >
              {isLoading ? "Running Benchmark..." : "Run Benchmark"}
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card className="h-full min-h-[240px]">
            <CardHeader>
              <CardTitle>Selected Prompt Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px] md:h-[210px] w-full rounded-md border p-4 bg-muted/20">
                {isFetchingPrompt ? (
                    <p className="text-muted-foreground">Loading prompt...</p>
                ) : promptContent ? (
                    <pre className="text-sm whitespace-pre-wrap font-mono">{promptContent}</pre>
                ) : (
                    <p className="text-muted-foreground">Select a prompt to see its content, or create prompts in the 'prompts' directory.</p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {isLoading && (
        <div className="text-center my-8">
          <p className="text-lg font-semibold">Comparing models, please wait...</p>
          {/* You can add a spinner here */}
        </div>
      )}

      {results && !isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
          {[results.llm1, results.llm2].map((result, index) => (
            result && (
              <Card key={index} className="flex flex-col">
                <CardHeader>
                  <CardTitle>LLM {index + 1}: {result.model}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <ScrollArea className="h-[300px] w-full rounded-md border p-4 flex-grow mb-4 bg-muted/20">
                    {result.error ? (
                      <div className="text-red-500 whitespace-pre-wrap">
                        <p className="font-semibold">Error:</p>
                        {result.error}
                      </div>
                    ) : result.response ? (
                      <div className="prose dark:prose-invert max-w-none text-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                          {result.response}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No response received.</p>
                    )}
                  </ScrollArea>
                  {result.response && (
                    <Button onClick={() => openResponseDialog(result.response)} variant="outline" className="mt-auto">
                      View Full Response
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Full LLM Response</DialogTitle>
            <DialogDescription>
              The complete response from the language model.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-grow rounded-md border overflow-y-auto">
            <div className="prose dark:prose-invert max-w-none p-4">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
              >
                {fullResponseContent}
              </ReactMarkdown>
            </div>
          </ScrollArea>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <footer className="text-center py-8 mt-auto text-muted-foreground">
        <p>LLM Benchmark App by p-dazzeo</p>
      </footer>
    </div>
  );
}
