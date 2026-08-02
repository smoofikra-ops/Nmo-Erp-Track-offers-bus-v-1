import { Toaster } from 'react-hot-toast';
import { AppRouter } from '@/routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <SidebarProvider>
          <AuthProvider>
            <AppRouter />
            <Toaster position="top-center" toastOptions={{ duration: 3000, style: { background: '#333', color: '#fff', direction: 'rtl' } }} />
          </AuthProvider>
        </SidebarProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
