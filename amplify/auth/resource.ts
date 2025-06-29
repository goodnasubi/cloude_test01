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