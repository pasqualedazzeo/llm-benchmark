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
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelSelector } from '@/components/model-selector';
import VariablesModal from '@/components/variables-modal';
import { getApiKey } from '@/lib/utils';
import { extractVariablesFromString, substituteVariables, detectDuplicateVariables } from '@/lib/prompt-utils'; // Import new utils
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
import { Textarea } from "@/components/ui/textarea";
import { VariableIcon } from "lucide-react";

interface BenchmarkResult {
  model: string;
  response?: string;
  error?: string;
}

export default function BenchmarkPage() {
  const [promptsList, setPromptsList] = useState<string[]>([]);
  const [selectedPromptFile, setSelectedPromptFile] = useState<string>("");
  const [promptContent, setPromptContent] = useState<string>("");
  const [promptVariables, setPromptVariables] = useState<string[]>([]);
  const [variableValues, setVariableValues] = useState<Record<string, string>>(
    {}
  );
  const [duplicateVariables, setDuplicateVariables] = useState<string[]>([]);

  const handleVariableValueChange = (variableName: string, value: string) => {
    setVariableValues((prevValues) => ({
      ...prevValues,
      [variableName]: value,
    }));
  };

  const [llm1, setLlm1] = useState<string>("openai/o4-mini"); // 
  const [llm2, setLlm2] = useState<string>("openai/gpt-4.1-nano"); // 
  const [results, setResults] = useState<{
    llm1?: BenchmarkResult;
    llm2?: BenchmarkResult;
  } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingPrompt, setIsFetchingPrompt] = useState<boolean>(false);
  const [fullResponseContent, setFullResponseContent] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isVariablesModalOpen, setIsVariablesModalOpen] = useState<boolean>(false);
  const [keysValid, setKeysValid] = useState<boolean>(true);
  const [missingKeyMessage, setMissingKeyMessage] = useState<string>("");

  const getServiceForModel = (modelName: string): string | null => {
    if (!modelName) return null;
    
    // Extract provider from the fully qualified model name (e.g., "openai/gpt-4")
    const parts = modelName.split('/');
    if (parts.length < 2) return null;
    
    const provider = parts[0].toUpperCase();
    return provider;
  };

  useEffect(() => {
    validateApiKeys();
  }, [llm1, llm2]);

  const validateApiKeys = () => {
    const service1 = getServiceForModel(llm1);
    const service2 = getServiceForModel(llm2);
    
    let missingKeys = [];
    
    if (service1) {
      const key1 = getApiKey(service1);
      if (!key1) missingKeys.push(service1);
    }
    
    if (service2) {
      const key2 = getApiKey(service2);
      if (!key2) missingKeys.push(service2);
    }
    
    // Remove duplicates
    missingKeys = [...new Set(missingKeys)];
    
    if (missingKeys.length > 0) {
      setKeysValid(false);
      setMissingKeyMessage(`Missing API key(s) for: ${missingKeys.join(', ')}. Please add them in Settings.`);
    } else {
      setKeysValid(true);
      setMissingKeyMessage("");
    }
  };

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
        setPromptVariables([]); // Clear previous variables
        setVariableValues({}); // Clear previous variable values
        try {
          const response = await fetch(`/api/prompt/${selectedPromptFile}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch prompt content for ${selectedPromptFile}`);
          }
          const data = await response.json();
          const newPromptContent = data.content;
          setPromptContent(newPromptContent);

          // Use imported utility function to parse variables
          const extractedVars = extractVariablesFromString(newPromptContent);
          setPromptVariables(extractedVars);
          
          // Check for duplicate variables
          const duplicateCheck = detectDuplicateVariables(newPromptContent);
          setDuplicateVariables(duplicateCheck.duplicateVariables);
          
          // Initialize variableValues for new variables
          const initialValues: Record<string, string> = {};
          extractedVars.forEach(v => initialValues[v] = "");
          setVariableValues(initialValues);

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
      return;
    }

    if (!keysValid) {
      alert(missingKeyMessage);
      return;
    }

    // Use imported utility function to substitute variables
    const processedPromptContent = substituteVariables(promptContent, variableValues);
    
    console.log("Running benchmark with:", { processedPromptContent, llm1, llm2 });
    setIsLoading(true);
    setResults(null);

    const service1 = getServiceForModel(llm1);
    const service2 = getServiceForModel(llm2);

    let apiKeyLlm1: string | null = null;
    let apiKeyLlm2: string | null = null;

    if (service1) {
      apiKeyLlm1 = getApiKey(service1);
      if (!apiKeyLlm1) {
        console.warn(`API key for ${service1} (LLM1: ${llm1}) not found. Benchmark might fail.`);
      }
    } else {
        console.warn(`Could not determine service for LLM1: ${llm1}. API key not fetched.`);
    }

    if (service2) {
      apiKeyLlm2 = getApiKey(service2);
      if (!apiKeyLlm2) {
        console.warn(`API key for ${service2} (LLM2: ${llm2}) not found. Benchmark might fail.`);
      }
    } else {
        console.warn(`Could not determine service for LLM2: ${llm2}. API key not fetched.`);
    }

    try {
      const response = await fetch('/api/benchmark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptContent: processedPromptContent, // Use processed content
          llm1,
          llm2,
          apiKeyLlm1,
          apiKeyLlm2,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Benchmark API error response:", errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);

      // Save the benchmark result to history
      try {
        await fetch('/api/benchmarks-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            promptContent,
            results: data,
            promptName: selectedPromptFile.replace('.txt', '')
          }),
        });
      } catch (error) {
        console.error("Error saving benchmark history:", error);
      }
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Benchmark Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="prompt-select" className="text-md font-medium">Prompt</label>
              <Select
                value={selectedPromptFile}
                onValueChange={setSelectedPromptFile}
                disabled={promptsList.length === 0 || isLoading || isFetchingPrompt}
              >
                <SelectTrigger id="prompt-select">
                  <SelectValue placeholder="Select a prompt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Available Prompts</SelectLabel>
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
            <ModelSelector
              llm1={llm1}
              setLlm1={setLlm1}
              llm2={llm2}
              setLlm2={setLlm2}
              disabled={isLoading}
            />



            {!keysValid && (
              <div className="text-red-500 text-sm">{missingKeyMessage}</div>
            )}
            
            {duplicateVariables.length > 0 && (
              <div className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">
                <strong>Error:</strong> Duplicate variables detected: {duplicateVariables.join(', ')}. 
                Each variable name must be unique in the prompt.
              </div>
            )}
            <Button
              onClick={handleRunBenchmark}
              disabled={isLoading || isFetchingPrompt || !promptContent || !llm1 || !llm2 || !keysValid || (promptVariables.length > 0 && promptVariables.some(v => !variableValues[v])) || duplicateVariables.length > 0}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3"
            >
              {isLoading ? "Running Benchmark..." : "Run Benchmark"}
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2">
          <Card className="h-full min-h-[240px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Selected Prompt Preview</CardTitle>
                {promptVariables.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVariablesModalOpen(true)}
                    className="flex items-center space-x-2"
                  >
                    <VariableIcon className="h-4 w-4" />
                    <span>Variables ({promptVariables.length})</span>
                    {promptVariables.some(v => !variableValues[v]) && (
                      <span className="w-2 h-2 bg-orange-500 rounded-full" />
                    )}
                  </Button>
                )}
              </div>
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

      <VariablesModal
        isOpen={isVariablesModalOpen}
        onClose={() => setIsVariablesModalOpen(false)}
        variables={promptVariables}
        variableValues={variableValues}
        onValueChange={handleVariableValueChange}
        onSave={() => {
          // Optional: Add any additional logic when variables are saved
          console.log('Variables saved:', variableValues);
        }}
      />

      <footer className="text-center py-4 mt-auto text-muted-foreground">
        <p>LLM Benchmark App by p-dazzeo</p>
      </footer>
    </div>
  );
}
