import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/lib/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const { isLoading } = useAuth();

  useEffect(() => {
    console.log('🔄 AuthCallback: Component mounted');
    console.log('🔄 AuthCallback: Query params:', router.query);
    
    // The actual auth handling is done in the useAuth hook
    // This component just shows a loading state
  }, [router.query]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Authenticating...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please wait while we verify your authentication.
          </p>
          {isLoading && (
            <p className="mt-4 text-xs text-gray-500">
              Verifying token with backend...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
