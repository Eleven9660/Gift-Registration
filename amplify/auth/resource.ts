import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    "custom:department": {
      dataType: "String",
      mutable: true,
    }
  },
  groups: ["Compliance", "Admin"],
});
