'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function GlobalError({
  error,
  resetError,
}: {
  error: Error & { digest?: string };
  resetError: () => void;
}) {
  const [isRecoveryAttempted, setIsRecoveryAttempted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Log error to console and external service
  useEffect(() => {
    console.error('Global Error:', error);

    // In production, you would send this to an error tracking service like Sentry
    // Example: Sentry.captureException(error);

    // Only attempt recovery once to prevent infinite loops
    if (!isRecoveryAttempted) {
      setIsRecoveryAttempted(true);
    }
  }, [error, isRecoveryAttempted]);

  const handleRetry = () => {
    resetError();
    setIsRecoveryAttempted(false);
    // Optionally redirect to home or refresh current page
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-6 max-w-2xl">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <svg className="w-8 h-8 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Error Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Une erreur est survenue
        </h1>

        {/* Error Description */}
        <p className="text-gray-600 dark:text-gray-300">
          Nous sommes désolés, mais quelque chose s&apos;est mal passé. Notre équipe a été notifiée et travaille à résoudre le problème.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
            <strong>Détails de l&apos;erreur:</strong> {error.message}
            {error.digest && (
              <>
                <br />
                <strong>Digest:</strong> {error.digest}
              </>
            )}
          </div>
        )}

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleRetry}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Essaie à nouveau
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex-1 px-6 py-3 bg-white text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Retour à l&apos;accueil
          </button>
        </div>

        {/* Optional: Show error details in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Informations de débogage
            </h2>
            <pre className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded overflow-auto max-h-48">
              {JSON.stringify(
                {
                  timestamp: new Date().toISOString(),
                  pathname,
                  error: {
                    name: error.name,
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                  },
                },
                null,
                2
              )}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}