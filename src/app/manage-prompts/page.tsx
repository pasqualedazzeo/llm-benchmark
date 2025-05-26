'use client';

import { useEffect, useState } from 'react';
import { detectDuplicateVariables } from '@/lib/prompt-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface PromptFile {
  name: string;
  content?: string; // Content is fetched on demand for editing
}

export default function ManagePromptsPage() {
  const [prompts, setPrompts] = useState<PromptFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newPromptFilename, setNewPromptFilename] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [isAddingPrompt, setIsAddingPrompt] = useState(false);

  const [editingPrompt, setEditingPrompt] = useState<PromptFile | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false);

  // Fetch prompts on mount
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/prompts');
      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.statusText}`);
      }
      const data = await response.json();
      setPrompts(data.map((name: string) => ({ name })));
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPrompt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newPromptFilename.trim() || !newPromptContent.trim()) {
      alert('Filename and content cannot be empty.');
      return;
    }
    
    // Check for duplicate variables
    const duplicateCheck = detectDuplicateVariables(newPromptContent);
    if (duplicateCheck.hasDuplicates) {
      alert(`Cannot create prompt with duplicate variables: ${duplicateCheck.duplicateVariables.join(', ')}. Each variable name must be unique.`);
      return;
    }
    
    let filename = newPromptFilename.trim();
    if (!filename.endsWith('.txt') && !filename.endsWith('.md')) {
        filename += '.txt'; // Default to .txt if no extension
    }

    setIsAddingPrompt(true);
    setError(null);
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content: newPromptContent }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to add prompt: ${response.statusText}`);
      }
      setNewPromptFilename('');
      setNewPromptContent('');
      await fetchPrompts(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsAddingPrompt(false);
    }
  };

  const handleEditPrompt = async (promptName: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/prompt/${encodeURIComponent(promptName)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch prompt content: ${response.statusText}`);
      }
      const data = await response.json();
      setEditingPrompt({ name: promptName, content: data.content });
      setEditText(data.content);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
  };

  const handleUpdatePrompt = async () => {
    if (!editingPrompt) return;
    
    // Check for duplicate variables
    const duplicateCheck = detectDuplicateVariables(editText);
    if (duplicateCheck.hasDuplicates) {
      setError(`Cannot save prompt with duplicate variables: ${duplicateCheck.duplicateVariables.join(', ')}. Each variable name must be unique.`);
      return;
    }
    
    setIsUpdatingPrompt(true);
    setError(null);
    try {
      const response = await fetch(`/api/prompt/${encodeURIComponent(editingPrompt.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editText }),
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to update prompt: ${response.statusText}`);
      }
      setEditingPrompt(null);
      setEditText('');
      // No need to fetchPrompts() here as only content changed, not the list itself
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsUpdatingPrompt(false);
    }
  };

  const handleDeletePrompt = async (promptName: string) => {
    if (!confirm(`Are you sure you want to delete ${promptName}?`)) {
      return;
    }
    setError(null);
    try {
      const response = await fetch(`/api/prompt/${encodeURIComponent(promptName)}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Failed to delete prompt: ${response.statusText}`);
      }
      await fetchPrompts(); // Refresh list
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
  };

  if (isLoading) return <p className="p-4">Loading prompts...</p>;

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">Prompt Manager</h1>

      {error && <p className="text-red-500 bg-red-100 p-3 rounded dark:bg-red-900 dark:text-red-200">Error: {error}</p>}

      <Card>
        <CardHeader>
          <CardTitle>Add New Prompt</CardTitle>
          <CardDescription>Create a new prompt file. It will be saved in the 'prompts' directory.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddPrompt} className="space-y-4">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="new-prompt-filename">Filename (e.g., my-prompt.txt or my-prompt.md)</Label>
              <Input
                id="new-prompt-filename"
                type="text"
                value={newPromptFilename}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPromptFilename(e.target.value)}
                placeholder="example-prompt.txt"
                required
              />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="new-prompt-content">Content</Label>
              <Textarea
                id="new-prompt-content"
                value={newPromptContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPromptContent(e.target.value)}
                placeholder="Enter your prompt text here..."
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={isAddingPrompt}>
              {isAddingPrompt ? 'Adding...' : 'Add Prompt'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Prompts</CardTitle>
          <CardDescription>Manage your current prompt files.</CardDescription>
        </CardHeader>
        <CardContent>
          {prompts.length === 0 && !isLoading && (
            <p>No prompts found. Add one above to get started!</p>
          )}
          {prompts.length > 0 && (
            <ul className="space-y-3">
              {prompts.map((prompt) => (
                <li key={prompt.name} className="flex justify-between items-center p-3 border rounded-md bg-card hover:bg-muted/50">
                  <span>{prompt.name}</span>
                  <div className="space-x-2">
                    <Dialog onOpenChange={(open) => !open && setEditingPrompt(null)}> {/* Reset editingPrompt on dialog close */}
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditPrompt(prompt.name)}>
                          Edit
                        </Button>
                      </DialogTrigger>
                      {editingPrompt && editingPrompt.name === prompt.name && (
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Edit Prompt: {editingPrompt.name}</DialogTitle>
                            <DialogDescription>
                              Modify the content of your prompt. Click save when you're done.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <Textarea
                              value={editText}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditText(e.target.value)}
                              rows={10}
                              className="min-h-[200px]"
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button onClick={handleUpdatePrompt} disabled={isUpdatingPrompt}>
                              {isUpdatingPrompt ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      )}
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePrompt(prompt.name)}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}