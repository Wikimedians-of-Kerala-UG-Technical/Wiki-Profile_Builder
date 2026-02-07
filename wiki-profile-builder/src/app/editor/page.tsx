'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { Code, Eye, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { parseWikitext } from '@/services/wikiService';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

export default function EditorPage() {
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    username,
    selectedDomain,
    rawWikitext,
    setRawWikitext,
    renderedHtml,
    setRenderedHtml,
  } = useStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no wikitext is loaded
  useEffect(() => {
    if (!rawWikitext && !username) {
      router.push('/');
    }
  }, [rawWikitext, username, router]);

  // Parse wikitext with 500ms debounce and AbortController
  const parseWithDebounce = useCallback(
    (text: string) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Set loading state
      setIsLoading(true);
      setError(null);

      // Create new timeout
      timeoutRef.current = setTimeout(async () => {
        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
          const result = await parseWikitext(
            text,
            selectedDomain,
            abortControllerRef.current.signal
          );

          if (result.success && result.html) {
            // Sanitize HTML with DOMPurify before rendering
            const sanitizedHtml = DOMPurify.sanitize(result.html, {
              ADD_TAGS: ['iframe'],
              ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling'],
            });
            setRenderedHtml(sanitizedHtml);
          } else if (result.error && result.error !== 'Request cancelled') {
            setError(result.error);
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            setError('Failed to parse wikitext');
          }
        } finally {
          setIsLoading(false);
        }
      }, 500);
    },
    [selectedDomain, setRenderedHtml]
  );

  // Initial parse on mount
  useEffect(() => {
    if (rawWikitext) {
      parseWithDebounce(rawWikitext);
    }
    
    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWikitextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setRawWikitext(newText);
    parseWithDebounce(newText);
  };

  const handleGenerateCode = () => {
    router.push('/generator');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
              </Link>
              <div className="text-sm text-gray-600">
                Editing: <span className="font-medium">User:{username}</span> on{' '}
                <span className="font-medium">{selectedDomain}</span>
              </div>
            </div>
            <Button
              onClick={handleGenerateCode}
              leftIcon={<Code className="w-4 h-4" />}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Generate Code
            </Button>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="px-4 py-2 bg-red-50">
            <div className="max-w-7xl mx-auto">
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            </div>
          </div>
        )}

        {/* Split-screen Editor */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Left: Wikitext Editor */}
          <div className="flex-1 flex flex-col border-r border-gray-200">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2">
              <Code className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Wikitext Editor</span>
            </div>
            <textarea
              value={rawWikitext}
              onChange={handleWikitextChange}
              className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none bg-white"
              placeholder="Enter your Wikitext here..."
              spellCheck={false}
            />
          </div>

          {/* Right: Live Preview */}
          <div className="flex-1 flex flex-col bg-white">
            <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Live Preview</span>
              </div>
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Rendering...
                </div>
              )}
            </div>
            <div className="flex-1 overflow-auto p-4">
              {isLoading && !renderedHtml ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner size="lg" />
                </div>
              ) : renderedHtml ? (
                <div
                  className="wiki-preview prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Start typing to see the preview...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wiki Preview Styles */}
      <style jsx global>{`
        .wiki-preview {
          font-family: sans-serif;
          line-height: 1.6;
        }
        .wiki-preview a {
          color: #0057B7;
        }
        .wiki-preview a:hover {
          text-decoration: underline;
        }
        .wiki-preview h1,
        .wiki-preview h2,
        .wiki-preview h3 {
          border-bottom: 1px solid #eee;
          padding-bottom: 0.3em;
        }
        .wiki-preview table {
          border-collapse: collapse;
        }
        .wiki-preview th,
        .wiki-preview td {
          border: 1px solid #ddd;
          padding: 0.5em;
        }
        .wiki-preview pre {
          background: #f5f5f5;
          padding: 1em;
          overflow-x: auto;
        }
        .wiki-preview code {
          background: #f5f5f5;
          padding: 0.2em 0.4em;
          border-radius: 3px;
        }
        .wiki-preview img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  );
}
