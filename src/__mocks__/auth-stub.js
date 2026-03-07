// CJS stub — used by Jest via moduleNameMapper so next-auth ESM is never loaded
const auth = () => Promise.resolve(null);
const signIn = () => Promise.resolve(null);
const signOut = () => Promise.resolve(null);
const handlers = {};
module.exports = { auth, signIn, signOut, handlers };
