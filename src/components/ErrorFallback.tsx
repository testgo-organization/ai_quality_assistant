import React from 'react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            ¡Ups! Algo salió mal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {error.message}
          </p>
        </div>
        <div className="mt-5">
          <button
            onClick={resetErrorBoundary}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-piacc-blue hover:bg-piacc-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-piacc-blue"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
