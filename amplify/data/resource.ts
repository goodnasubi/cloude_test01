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