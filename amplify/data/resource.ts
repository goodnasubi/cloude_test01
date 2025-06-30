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
      allow.groups(['admin']).to(['create', 'update', 'delete']),
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

  UserGroup: a
    .model({
      userId: a.string().required(),
      groupName: a.string().required(),
      assignedAt: a.datetime(),
    })
    .authorization((allow) => [
      allow.groups(['admin']).to(['create', 'read', 'update', 'delete']),
      allow.authenticated().to(['read']),
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