"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-[40vh] flex items-center justify-center p-8">
          <div className="bg-surface border border-red-200 rounded-2xl shadow-md max-w-lg w-full p-8 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="font-display font-bold text-xl text-ink">Terjadi Kesalahan</h2>
            <p className="text-sm text-muted">
              Admin panel mengalami gangguan. Silakan coba lagi.
            </p>
            {this.state.error && (
              <details className="text-xs text-left bg-bg p-3 rounded-lg border border-outline">
                <summary className="font-bold text-muted cursor-pointer">Detail Error</summary>
                <pre className="mt-2 text-red-600 whitespace-pre-wrap font-mono">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-deep text-white font-bold py-3 px-6 rounded-xl text-sm transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
