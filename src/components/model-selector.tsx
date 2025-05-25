"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { getApiKey } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface ModelSelectorProps {
  llm1: string;
  setLlm1: (value: string) => void;
  llm2: string;
  setLlm2: (value: string) => void;
  disabled?: boolean;
}

interface ModelOption {
  value: string;
  label: string;
  provider: string;
}

const defaultModels: ModelOption[] = [
  { value: "openai/o4-mini", label: "o4-mini", provider: "OPENAI" },
  { value: "openai/gpt-4.1-nano", label: "gpt-4.1-nano", provider: "OPENAI" },
  { value: "anthropic/claude-4-sonnet", label: "Claude 4 Sonnet", provider: "ANTHROPIC" },
  { value: "gemini/gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "GEMINI" },
  // It might be good to include the current default models from page.tsx as well,
  // or ensure they are part of the new list if they are different.
  // For now, strictly sticking to the issue's list.
];

export function ModelSelector({ llm1, setLlm1, llm2, setLlm2, disabled }: ModelSelectorProps) {
  const [llm1KeyStatus, setLlm1KeyStatus] = useState<boolean>(true);
  const [llm2KeyStatus, setLlm2KeyStatus] = useState<boolean>(true);

  const checkKeyStatus = (modelValue: string): boolean => {
    const model = defaultModels.find(m => m.value === modelValue);
    if (!model) return true; // Default to true if model not found
    
    // Check if the provider API key exists
    const apiKey = getApiKey(model.provider);
    return !!apiKey;
  };

  useEffect(() => {
    setLlm1KeyStatus(checkKeyStatus(llm1));
    setLlm2KeyStatus(checkKeyStatus(llm2));
  }, [llm1, llm2]);

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="llm1-select">LLM 1</Label>
          {!llm1KeyStatus && (
            <div className="flex items-center text-amber-500 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>API key required</span>
            </div>
          )}
          {llm1KeyStatus && llm1 && (
            <div className="flex items-center text-green-500 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span>Ready</span>
            </div>
          )}
        </div>
        <Select
          value={llm1}
          onValueChange={setLlm1}
          disabled={disabled}
        >
          <SelectTrigger id="llm1-select">
            <SelectValue placeholder="Select LLM 1" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Models</SelectLabel>
              {defaultModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="llm2-select">LLM 2</Label>
          {!llm2KeyStatus && (
            <div className="flex items-center text-amber-500 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              <span>API key required</span>
            </div>
          )}
          {llm2KeyStatus && llm2 && (
            <div className="flex items-center text-green-500 text-xs">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              <span>Ready</span>
            </div>
          )}
        </div>
        <Select
          value={llm2}
          onValueChange={setLlm2}
          disabled={disabled}
        >
          <SelectTrigger id="llm2-select">
            <SelectValue placeholder="Select LLM 2" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Models</SelectLabel>
              {defaultModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
