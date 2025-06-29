import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../lib/auth-service';
import { useAuth } from '../../hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const { customState } = router.query;
      if (customState && typeof customState === 'string') {
        authService.recordUserServiceAccess(user.userId, customState);
        router.push(`/${customState}`);
      } else {
        router.push('/');
      }
    }
  }, [user, router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div>Processing authentication...</div>
    </div>
  );
}