'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, Globe, Download, RefreshCw } from 'lucide-react';
import { fetchProfile, WIKI_DOMAINS } from '@/services/wikiService';
import { useStore } from '@/store/useStore';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ErrorBanner } from '@/components/ui/ErrorBanner';

export default function HomePage() {
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    username,
    setUsername,
    selectedDomain,
    setSelectedDomain,
    setRawWikitext,
    isLoading,
    setLoading,
    error,
    setError,
  } = useStore();

  const [localUsername, setLocalUsername] = useState(username);

  const handleFetchProfile = async () => {
    if (!localUsername.trim()) {
      setError('Please enter a username');
      return;
    }

    // Abort previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setError(null);
    setLoading(true);

    try {
      const result = await fetchProfile(
        localUsername.trim(),
        selectedDomain,
        abortControllerRef.current.signal
      );

      if (!result.success) {
        setError(result.error || 'Failed to fetch profile');
        return;
      }

      if (result.missing) {
        setError(`User page "User:${localUsername}" does not exist on ${selectedDomain}`);
        return;
      }

      // Success - store the wikitext and navigate
      setUsername(localUsername.trim());
      setRawWikitext(result.wikitext || '');
      router.push('/editor');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFetchProfile();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fetch Your Wiki Profile</h1>
          <p className="text-gray-600 mt-2">
            Enter your Wikimedia username to fetch and edit your user page
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Download className="w-5 h-5 text-[#0057B7]" />
              Profile Fetcher
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            )}

            <Input
              label="Username"
              type="text"
              placeholder="Enter your Wikimedia username"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              leftIcon={<User className="w-5 h-5" />}
              disabled={isLoading}
            />

            <Select
              label="Wiki Project"
              options={WIKI_DOMAINS.map((d) => ({ value: d.value, label: d.label }))}
              value={selectedDomain}
              onChange={setSelectedDomain}
              leftIcon={<Globe className="w-5 h-5" />}
              disabled={isLoading}
            />

            <Button
              onClick={handleFetchProfile}
              className="w-full"
              isLoading={isLoading}
              leftIcon={isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            >
              {isLoading ? 'Fetching...' : 'Fetch Your Profile'}
            </Button>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This tool fetches your public user page from Wikimedia projects.
          </p>
          <p className="mt-1">
            Supported projects: Meta-Wiki, Wikipedia, Commons, Wikidata, and more.
          </p>
        </div>
      </main>
    </div>
  );
}
