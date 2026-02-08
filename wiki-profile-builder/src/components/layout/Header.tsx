'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, User, FileCode } from 'lucide-react';
import { auth, signOut } from '@/services/firebase';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/Button';

export function Header() {
  const router = useRouter();
  const { user, reset } = useStore();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      reset();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-[#0057B7] text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <FileCode className="w-8 h-8" />
            <span className="font-bold text-xl">WikiProfile Builder</span>
          </Link>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-white/80">
                <User className="w-4 h-4" />
                <span className="text-sm">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4" />}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
