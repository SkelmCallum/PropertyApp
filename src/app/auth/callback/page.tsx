'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/listings';

  useEffect(() => {
    const supabase = createClient();

    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href.split('?')[1] || ''
      );

      if (error) {
        console.error('Auth callback error:', error);
        router.push('/auth/login?error=callback_failed');
      } else {
        router.push(redirectTo);
      }
    };

    handleAuthCallback();
  }, [router, redirectTo]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}

