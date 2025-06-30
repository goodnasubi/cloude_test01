import { generateClient } from 'aws-amplify/data';
import { signInWithRedirect, getCurrentUser, signOut, fetchUserAttributes } from 'aws-amplify/auth';
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
      provider: { custom: 'SAML' },
      customState: serviceConfig.serviceId
    });
  }

  private async authenticateWithCognito() {
    await signInWithRedirect({
      provider: { custom: 'Cognito' }
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

  async isUserInGroup(userId: string, groupName: string): Promise<boolean> {
    try {
      const { data } = await client.models.UserGroup.list({
        filter: { 
          userId: { eq: userId },
          groupName: { eq: groupName }
        }
      });
      return data.length > 0;
    } catch (error) {
      console.error('Error checking user group:', error);
      return false;
    }
  }

  async getUserGroups(userId: string): Promise<string[]> {
    try {
      const { data } = await client.models.UserGroup.list({
        filter: { userId: { eq: userId } }
      });
      return data.map(group => group.groupName);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  }

  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentAuthenticatedUser();
      if (!user) return false;
      
      return await this.isUserInGroup(user.userId, 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async getAllServices() {
    try {
      const { data } = await client.models.Service.list();
      return data;
    } catch (error) {
      console.error('Error fetching all services:', error);
      return [];
    }
  }

  async createService(service: Omit<ServiceConfig, 'id'>) {
    try {
      const { data } = await client.models.Service.create({
        ...service,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(id: string, service: Partial<ServiceConfig>) {
    try {
      const { data } = await client.models.Service.update({
        id,
        ...service,
        updatedAt: new Date().toISOString(),
      });
      return data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  async deleteService(id: string) {
    try {
      await client.models.Service.delete({ id });
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();