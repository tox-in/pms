import React, { Component, ErrorInfo } from "react";
import { Helmet } from "react-helmet";
import { FiAlertTriangle } from "react-icons/fi";
import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error: ", error, errorInfo);
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center p-4">
          <Helmet>
            <title>Error | Smart-Park</title>
          </Helmet>

          <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
              <div className="flex justify-center text-white mb-4">
                <FiAlertTriangle size={48} className="text-yellow-300" />
              </div>
              <h1 className="text-2xl font-bold text-white">
                Oops! Something went wrong
              </h1>
            </div>

            <div className="p-6 text-center space-y-4">
              <p className="text-gray-600">
                We encountered an unexpected error. Our team has been notified
                and is working on a fix.
              </p>

              {this.state.error && (
                <details className="text-left bg-gray-50 p-3 rounded-lg">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                    Error Details
                  </summary>
                  <div className="mt-2 text-xs text-red-500 font-mono">
                    {this.state.error.toString()}
                  </div>
                </details>
              )}

              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
