// https://vitejs.dev/guide/env-and-mode.html#env-variables
// eslint-disable-next-line @typescript-eslint/dot-notation
const ENV = process["env"];

export default {
  FIRESTORE_CLIENT_EMAIL: ENV.FIRESTORE_CLIENT_EMAIL,
  FIRESTORE_PRIVATE_KEY: ENV.FIRESTORE_PRIVATE_KEY
};
