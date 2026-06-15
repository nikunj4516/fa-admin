import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
          <div className="max-w-xl w-full bg-slate-950 border border-red-900/40 rounded-2xl p-8 shadow-2xl">
            <h1 className="text-xl font-bold text-red-500 mb-2">Application Crash Detected</h1>
            <p className="text-slate-400 text-sm mb-6">
              A runtime exception occurred. Please check the technical details below:
            </p>
            <div className="bg-slate-900 p-4 rounded-xl font-mono text-xs text-red-400 overflow-auto max-h-60 border border-slate-800">
              <strong className="block mb-1">{this.state.error?.toString()}</strong>
              <pre className="mt-2 text-[10px] leading-relaxed text-slate-500">
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
