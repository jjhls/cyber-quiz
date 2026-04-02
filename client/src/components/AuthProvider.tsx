import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const user = await authApi.getMe();
        setUser(user);
      } catch {
        // 401 is expected for unauthenticated users - just clear state
        setUser(null);
      }
    };
    restoreSession();
  }, [setUser, setLoading]);

  return <>{children}</>;
}
