'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Clipboard, Check, Code, Edit } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';

export default function GeneratorPage() {
  const router = useRouter();
  const { username, rawWikitext, selectedDomain } = useStore();

  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  // Redirect if no wikitext
  useEffect(() => {
    if (!rawWikitext) {
      router.push('/');
    }
  }, [rawWikitext, router]);

  // Typing animation effect
  useEffect(() => {
    if (!rawWikitext) return;

    let currentIndex = 0;
    const charsPerFrame = 5; // Characters to add per frame for faster animation
    const frameDelay = 10; // ms between frames

    const animate = () => {
      if (currentIndex < rawWikitext.length) {
        const nextIndex = Math.min(currentIndex + charsPerFrame, rawWikitext.length);
        setDisplayedText(rawWikitext.slice(0, nextIndex));
        currentIndex = nextIndex;
        animationRef.current = setTimeout(animate, frameDelay);
      } else {
        setIsAnimating(false);
      }
    };

    // Start animation
    animate();

    // Cleanup
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [rawWikitext]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawWikitext);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleSkipAnimation = () => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
    }
    setDisplayedText(rawWikitext);
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/editor">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                className="text-gray-300 hover:text-white hover:bg-gray-800"
              >
                Back to Editor
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {isAnimating && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkipAnimation}
                className="text-gray-400 hover:text-white hover:bg-gray-800"
              >
                Skip Animation
              </Button>
            )}
            <Button
              onClick={handleCopy}
              disabled={isAnimating}
              leftIcon={isCopied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
              className={isCopied ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {isCopied ? 'Copied!' : 'Copy to Clipboard'}
            </Button>
          </div>
        </div>

        {/* Info Bar */}
        <div className="bg-gray-800 rounded-t-lg px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-[#0057B7]" />
            <span className="text-gray-300 font-medium">Generated Wikitext</span>
          </div>
          <div className="text-gray-400 text-sm">
            User:{username} | {selectedDomain}
          </div>
        </div>

        {/* Code Block */}
        <motion.div
          className="flex-1 bg-[#1e1e1e] rounded-b-lg overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full overflow-auto p-6">
            <pre className="font-mono text-sm text-green-400 whitespace-pre-wrap break-words">
              <code>{displayedText}</code>
              {isAnimating && (
                <motion.span
                  className="inline-block w-2 h-5 bg-green-400 ml-1"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </pre>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link href="/editor">
            <Button
              variant="outline"
              leftIcon={<Edit className="w-4 h-4" />}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Continue Editing
            </Button>
          </Link>
          <Button
            onClick={handleCopy}
            disabled={isAnimating}
            leftIcon={isCopied ? <Check className="w-4 h-4" /> : <Clipboard className="w-4 h-4" />}
            className={isCopied ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            {isCopied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>Copy this Wikitext and paste it into your user page on {selectedDomain}</p>
          <p className="mt-1">
            Go to{' '}
            <a
              href={`https://${selectedDomain}/wiki/User:${username}?action=edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#0057B7] hover:underline"
            >
              User:{username}
            </a>{' '}
            to edit your page directly.
          </p>
        </div>
      </main>
    </div>
  );
}
