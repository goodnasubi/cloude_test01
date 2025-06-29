AWS Amplify Gen2を使用して、URLパスパラメータによる自動認証システムを構築するコードを作成します。

## 1. Amplify Gen2 バックエンド設定

### `amplify/backend.ts`
```typescript
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';

export const backend = defineBackend({
  auth,
  data,
  storage,
});
```

### `amplify/auth/resource.ts`
```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
    externalProviders: {
      saml: {
        metadata: {
          metadataContent: process.env.SAML_METADATA_XML || '',
          metadataType: 'XML',
        },
        name: 'SAML',
      },
      callbackUrls: ['http://localhost:3000/auth/callback'],
      logoutUrls: ['http://localhost:3000/auth/logout'],
    },
  },
});
```

### `amplify/data/resource.ts`
```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Service: a
    .model({
      serviceId: a.string().required(),
      serviceName: a.string().required(),
      authType: a.enum(['cognito', 'saml']),
      idpProvider: a.string(),
      samlMetadata: a.string(),
      isActive: a.boolean().default(true),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.publicApiKey(),
      allow.authenticated(),
    ]),

  UserService: a
    .model({
      userId: a.string().required(),
      serviceId: a.string().required(),
      lastLogin: a.datetime(),
      isAuthorized: a.boolean().default(false),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated(),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
```

## 2. Next.js フロントエンド実装

### `amplify_outputs.json` の設定
```json
{
  "auth": {
    "user_pool_id": "your-user-pool-id",
    "user_pool_client_id": "your-user-pool-client-id",
    "identity_pool_id": "your-identity-pool-id",
    "password_policy": {
      "min_length": 8,
      "require_lowercase": true,
      "require_numbers": true,
      "require_symbols": true,
      "require_uppercase": true
    },
    "oauth": {
      "identity_providers": ["COGNITO", "SAML"],
      "domain": "your-cognito-domain.auth.region.amazoncognito.com",
      "scopes": ["openid", "email", "profile"],
      "redirect_sign_in": "http://localhost:3000/auth/callback",
      "redirect_sign_out": "http://localhost:3000/auth/logout",
      "response_type": "code"
    }
  },
  "data": {
    "url": "your-appsync-api-url",
    "region": "your-region",
    "default_authorization_type": "API_KEY",
    "api_key": "your-api-key"
  }
}
```

### `pages/_app.tsx`
```tsx
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import type { AppProps } from 'next/app';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Authenticator.Provider>
      <Component {...pageProps} />
    </Authenticator.Provider>
  );
}
```

### `lib/auth-service.ts`
```typescript
import { generateClient } from 'aws-amplify/data';
import { signInWithRedirect, getCurrentUser, signOut } from 'aws-amplify/auth';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

export interface ServiceConfig {
  serviceId: string;
  serviceName: string;
  authType: 'cognito' | 'saml';
  idpProvider?: string;
  samlMetadata?: string;
  isActive: boolean;
}

export class AuthService {
  async getServiceConfig(serviceId: string): Promise<ServiceConfig | null> {
    try {
      const { data } = await client.models.Service.list({
        filter: { serviceId: { eq: serviceId } }
      });
      
      return data.length > 0 ? data[0] as ServiceConfig : null;
    } catch (error) {
      console.error('Error fetching service config:', error);
      return null;
    }
  }

  async authenticateUser(serviceConfig: ServiceConfig) {
    try {
      if (serviceConfig.authType === 'saml') {
        await this.authenticateWithSAML(serviceConfig);
      } else {
        await this.authenticateWithCognito();
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  private async authenticateWithSAML(serviceConfig: ServiceConfig) {
    await signInWithRedirect({
      provider: 'SAML',
      customState: serviceConfig.serviceId
    });
  }

  private async authenticateWithCognito() {
    await signInWithRedirect({
      provider: 'Cognito'
    });
  }

  async getCurrentAuthenticatedUser() {
    try {
      return await getCurrentUser();
    } catch (error) {
      return null;
    }
  }

  async signOut() {
    await signOut();
  }

  async recordUserServiceAccess(userId: string, serviceId: string) {
    try {
      await client.models.UserService.create({
        userId,
        serviceId,
        lastLogin: new Date().toISOString(),
        isAuthorized: true
      });
    } catch (error) {
      console.error('Error recording user service access:', error);
    }
  }
}

export const authService = new AuthService();
```

### `hooks/useAuth.ts`
```typescript
import { useState, useEffect } from 'react';
import { authService } from '../lib/auth-service';
import { Hub } from 'aws-amplify/utils';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    
    const hubListener = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          setUser(payload.data);
          break;
        case 'signedOut':
          setUser(null);
          break;
      }
    });

    return () => hubListener();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await authService.getCurrentAuthenticatedUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading };
}
```

### `pages/[serviceId].tsx`
```tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { authService, ServiceConfig } from '../lib/auth-service';
import { useAuth } from '../hooks/useAuth';

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
          <p><strong>User ID:</strong> {user.userId}</p>
          <p><strong>Email:</strong> {user.signInDetails?.loginId}</p>
        </div>
      </div>
    </div>
  );
}
```

### `pages/auth/callback.tsx`
```tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { authService } from '../../lib/auth-service';
import { useAuth } from '../../hooks/useAuth';

export default function AuthCallback() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // カスタム状態からserviceIdを取得
      const { customState } = router.query;
      if (customState && typeof customState === 'string') {
        // ユーザーのサービスアクセスを記録
        authService.recordUserServiceAccess(user.userId, customState);
        // 元のサービスページにリダイレクト
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
```

### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}

module.exports = nextConfig
```

## 3. 使用方法

1. **サービス設定の登録**:
```typescript
// 管理画面や初期設定で以下のようなサービスを登録
const services = [
  {
    serviceId: 'app1',
    serviceName: 'Application 1',
    authType: 'cognito',
    isActive: true
  },
  {
    serviceId: 'app2',
    serviceName: 'Application 2',
    authType: 'saml',
    idpProvider: 'Azure AD',
    samlMetadata: 'SAML metadata XML...',
    isActive: true
  }
];
```

2. **URL アクセス**:
- `http://localhost:3000/app1` → Cognito認証
- `http://localhost:3000/app2` → SAML認証

この実装により、URLパスパラメータに基づいて自動的に適切な認証方式が選択され、DBで管理されたサービス設定に従って認証が実行されます。
