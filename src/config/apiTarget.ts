// Which backend a build talks to.
//   'auto'   -> debug builds use the local backend, release builds use the hosted one (default)
//   'local'  -> always the local backend (fast release build for testing against localhost)
//   'hosted' -> always the hosted backend
//
// KEEP THIS AS 'auto' IN GIT. Switch it to 'local' only while building a test
// APK for a phone connected over USB, then switch it back.
export type ApiTarget = 'auto' | 'local' | 'hosted';

export const API_TARGET: ApiTarget = 'auto';
