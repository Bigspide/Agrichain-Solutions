'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function Error({
  error,
  resetError,
}: {
  error: Error & { digest?: string };
  resetError: () => void;
}) {
  const [isRecoveryAttempted, setIsRecoveryAttempted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Log error to console
  useEffect(() => {
    console.error(`Error in route ${pathname}:`, error);

    // In production, send to error tracking service
    // Example: Sentry.captureException(error, { extra: { pathname } });

    if (!isRecoveryAttempted) {
      setIsRecoveryAttempted(true);
    }
  }, [error, pathname, isRecoveryAttempted]);

  const handleRetry = () => {
    resetError();
    setIsRecoveryAttempted(false);
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4 max-w-xl w-full">
        {/* Error Icon */}
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/20 mb-3">
          <svg className="w-6 h-6 text-primary-500 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Quelque chose s&apos;est mal passé
        </h2>

        {/* Error Description */}
        <p className="text-gray-600 dark:text-gray-300">
          Nous rencontrons un problème technique sur cette page. Veuillez réessayer dans quelques instants.
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <strong>Erreur:</strong> {error.message}
            </div>
          )}
        </p>

        {/* Recovery Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 px-5 py-2.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Essaie à nouveau
          </button>

          <button
            onClick={() => router.push('/')}
            className="flex-1 px-5 py-2.5 bg-white text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
}