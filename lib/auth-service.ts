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