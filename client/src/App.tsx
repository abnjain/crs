import { Toaster } from 'react-hot-toast';
import { AuthProvider, MessagingProvider, NotificationProvider, ThemeProvider } from './context';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRouter } from './router';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <MessagingProvider>
              <AppRouter />
            </MessagingProvider>
          </NotificationProvider>
          <Toaster
            position="top-center"
            gutter={12}
            containerClassName="app-toaster-root"
            toastOptions={{
              duration: 5000,
              className: 'app-toast',
              style: {
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-lg)',
              },
              error: {
                style: {
                  background: 'var(--bg-surface)',
                  color: 'var(--color-red)',
                  border: '1px solid var(--border-subtle)',
                },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
