import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CustomErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Aquí podrías enviar el error a tu servicio de logging preferido
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Ups! Algo salió mal
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {this.state.error?.message || 'Ha ocurrido un error inesperado.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-2 px-4 bg-piacc-blue hover:bg-piacc-blue/90 text-white rounded-md transition-colors"
            >
              Recargar la página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
