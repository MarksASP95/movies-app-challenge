import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  beforeSessionSaved: async (session, idToken) => {
    console.log("BEFORE SESSION SAVED", session);
    console.log(idToken);
    return session;
  },
  // onCallback: async (error, ctx, session) => {
  //   console.log("ON CALLBACK", session);
  //   console.log('CONTEXT', ctx)
  //   return NextResponse.json({ success: true });
  // },
});
