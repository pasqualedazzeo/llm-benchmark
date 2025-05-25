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

interface ModelSelectorProps {
  llm1: string;
  setLlm1: (value: string) => void;
  llm2: string;
  setLlm2: (value: string) => void;
  disabled?: boolean;
}

const defaultModels = [
  { value: "o4-mini", label: "o4-mini" },
  { value: "gpt-4.1-nano", label: "gpt-4.1-nano" },
  { value: "claude-4-sonnet", label: "Claude 4 Sonnet" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  // It might be good to include the current default models from page.tsx as well,
  // or ensure they are part of the new list if they are different.
  // For now, strictly sticking to the issue's list.
];

export function ModelSelector({ llm1, setLlm1, llm2, setLlm2, disabled }: ModelSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="llm1-select">LLM 1</Label>
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
        <Label htmlFor="llm2-select">LLM 2</Label>
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
