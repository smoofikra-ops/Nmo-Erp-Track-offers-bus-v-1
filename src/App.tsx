import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from '@/routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { AdminSecurityProvider } from '@/contexts/AdminSecurityContext';

export default function App() {
  return (
    <GlobalErrorBoundary>
    <ThemeProvider>
      <SettingsProvider>
        <SidebarProvider>
          <AuthProvider>
            <AdminSecurityProvider>
            <AppRouter />
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', direction: 'rtl' } }} />
          </AdminSecurityProvider>
          </AuthProvider>
        </SidebarProvider>
      </SettingsProvider>
    </ThemeProvider>
    </GlobalErrorBoundary>
  );
}
