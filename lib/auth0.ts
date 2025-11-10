import { SdkError } from "@auth0/nextjs-auth0/errors";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { OnCallbackContext, SessionData } from "@auth0/nextjs-auth0/types";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  onCallback: async (
    error: SdkError | null,
    ctx: OnCallbackContext,
    session: SessionData | null
  ) => {
    return NextResponse.redirect(
      new URL(ctx.returnTo ?? "/handle-login", process.env.APP_BASE_URL)
    );
  },
});
