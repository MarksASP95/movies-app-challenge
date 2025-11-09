import { Auth0Client } from "@auth0/nextjs-auth0/server";

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session, idToken) => {
    console.log("BEFORE SESSION SAVED", session);
    console.log(idToken);
    return session;
  },
});
