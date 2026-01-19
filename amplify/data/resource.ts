import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  DeclarationStatus: a.enum([
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'APPROVED',
    'REJECTED',
    'ESCALATED'
  ]),
  GiftType: a.enum([
    'CASH',
    'PHYSICAL',
    'IN_KIND'
  ]),
  Direction: a.enum([
    'RECEIVED',
    'ISSUED'
  ]),
  
  Declaration: a.model({
    direction: a.ref('Direction').required(),
    status: a.ref('DeclarationStatus'),
    giftType: a.ref('GiftType').required(),
    description: a.string().required(),
    estimatedValue: a.float().required(), // KES
    giftDate: a.date().required(),
    
    counterpartyName: a.string().required(),
    counterpartyOrg: a.string().required(),
    counterpartyRelationship: a.string().required(),
    justification: a.string().required(),
    
    // Workflow
    reviews: a.hasMany('Review', 'declarationId'),
  })
  .authorization(allow => [
    allow.owner(), // Owner can create, read, update, delete their own
    allow.group('Compliance').to(['read', 'update']), // Compliance can view and update (e.g. status)
    allow.group('Admin').to(['read', 'update', 'delete'])
  ]),

  Review: a.model({
    declarationId: a.id().required(),
    declaration: a.belongsTo('Declaration', 'declarationId'),
    comment: a.string(),
    decision: a.enum(['APPROVED', 'REJECTED', 'REQUEST_INFO']),
    reviewerId: a.string(),
  })
  .authorization(allow => [
    allow.group('Compliance').to(['create', 'read', 'update']),
    allow.group('Admin').to(['create', 'read', 'update', 'delete']),
    allow.owner().to(['read']) // Declaration owner can read reviews? Yes, for transparency.
  ])
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});
