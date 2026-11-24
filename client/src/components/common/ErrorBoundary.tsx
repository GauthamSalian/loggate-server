import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in LogGate client:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('loggate_jwt');
    localStorage.removeItem('loggate_user');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: '#f9fafb',
          fontFamily: 'Inter, sans-serif'
        }}>
          <div style={{
            maxWidth: '500px',
            width: '100%',
            background: '#fff',
            borderRadius: '12px',
            border: '1px solid #e4e4e7',
            padding: '28px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            textAlign: 'center'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#71717a', marginBottom: '16px' }}>
              {this.state.error?.message || 'An unexpected error occurred during rendering.'}
            </p>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '8px 16px',
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '8px 16px',
                  background: '#f4f4f5',
                  color: '#18181b',
                  border: '1px solid #e4e4e7',
                  borderRadius: '6px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Clear Session & Restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
