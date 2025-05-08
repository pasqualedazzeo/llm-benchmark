'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HomeIcon, ListChecksIcon, HistoryIcon } from 'lucide-react'; // Example icons

export function Navbar() {
  return (
    <nav className="bg-background border-b px-4 py-2 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 text-lg font-semibold hover:text-primary transition-colors">
          <HomeIcon className="h-6 w-6" />
          <span>LLM Benchmark</span>
        </Link>
        <div className="flex space-x-2">
          <Link href="/manage-prompts" passHref legacyBehavior={false}>
            <Button variant="ghost" asChild>
                <span className="flex items-center">
                    <ListChecksIcon className="mr-2 h-4 w-4" /> Manage Prompts
                </span>
            </Button>
          </Link>
          <Link href="/benchmarks-history" passHref legacyBehavior={false}>
            <Button variant="ghost" asChild>
                <span className="flex items-center">
                    <HistoryIcon className="mr-2 h-4 w-4" /> Benchmark History
                </span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
