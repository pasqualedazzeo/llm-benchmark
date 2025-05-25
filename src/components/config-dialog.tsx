"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveApiKey, getApiKey } from '@/lib/utils';

interface ConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigDialog({ isOpen, onClose }: ConfigDialogProps) {
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [anthropicApiKey, setAnthropicApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');

  // Load API keys from local storage when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      const loadedOpenaiKey = getApiKey('OPENAI');
      if (loadedOpenaiKey) setOpenaiApiKey(loadedOpenaiKey);

      const loadedAnthropicKey = getApiKey('ANTHROPIC');
      if (loadedAnthropicKey) setAnthropicApiKey(loadedAnthropicKey);

      const loadedGeminiKey = getApiKey('GEMINI');
      if (loadedGeminiKey) setGeminiApiKey(loadedGeminiKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveApiKey('OPENAI', openaiApiKey);
    saveApiKey('ANTHROPIC', anthropicApiKey);
    saveApiKey('GEMINI', geminiApiKey);
    // alert("API Keys saved!"); // Optional: provide user feedback
    onClose(); // Close dialog after saving
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configure API Keys</DialogTitle>
          <DialogDescription>
            Manage your API keys for different services here. Your keys are stored in your browser&apos;s local storage and are not sent to any server except the respective AI provider.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="openaiApiKey" className="text-right">
              OpenAI
            </Label>
            <Input
              id="openaiApiKey"
              type="password"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your OpenAI API Key"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="anthropicApiKey" className="text-right">
              Anthropic
            </Label>
            <Input
              id="anthropicApiKey"
              type="password"
              value={anthropicApiKey}
              onChange={(e) => setAnthropicApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your Anthropic API Key"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="geminiApiKey" className="text-right">
              Gemini
            </Label>
            <Input
              id="geminiApiKey"
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your Gemini API Key"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>
            Save Keys
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
