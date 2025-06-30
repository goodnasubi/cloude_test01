import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { authService, ServiceConfig } from '../lib/auth-service';
import { useAuth } from '../hooks/useAuth';
import { AuthUser } from 'aws-amplify/auth';

export default function ServicePage() {
  const router = useRouter();
  const { serviceId } = router.query;
  const { user, loading } = useAuth();
  const [serviceConfig, setServiceConfig] = useState<ServiceConfig | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (serviceId && typeof serviceId === 'string') {
      loadServiceConfig(serviceId);
    }
  }, [serviceId]);

  useEffect(() => {
    if (serviceConfig && !user && !loading) {
      handleAuthentication();
    }
  }, [serviceConfig, user, loading]);

  const loadServiceConfig = async (id: string) => {
    try {
      const config = await authService.getServiceConfig(id);
      if (!config) {
        setError('Service not found');
        return;
      }
      if (!config.isActive) {
        setError('Service is not active');
        return;
      }
      setServiceConfig(config);
    } catch (error) {
      setError('Failed to load service configuration');
    }
  };

  const handleAuthentication = async () => {
    if (!serviceConfig) return;
    
    setAuthLoading(true);
    try {
      await authService.authenticateUser(serviceConfig);
    } catch (error) {
      setError('Authentication failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await authService.signOut();
    router.push('/');
  };

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div>Redirecting to authentication...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome to {serviceConfig?.serviceName}
          </h1>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Service Information</h2>
          <p><strong>Service ID:</strong> {serviceConfig?.serviceId}</p>
          <p><strong>Authentication Type:</strong> {serviceConfig?.authType}</p>
          {serviceConfig?.idpProvider && (
            <p><strong>Identity Provider:</strong> {serviceConfig.idpProvider}</p>
          )}
        </div>

        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p><strong>User ID:</strong> {(user as AuthUser)?.userId}</p>
          <p><strong>Email:</strong> {(user as AuthUser)?.signInDetails?.loginId}</p>
        </div>
      </div>
    </div>
  );
}