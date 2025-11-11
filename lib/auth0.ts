import { SdkError } from "@auth0/nextjs-auth0/errors";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { OnCallbackContext, SessionData } from "@auth0/nextjs-auth0/types";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  appBaseUrl: process.env.AUTH0_BASE_URL || process.env.APP_BASE_URL,
  session: {
    cookie: {
      path: "/",
      sameSite: "lax",
      secure:
        process.env.NODE_ENV === "production" || process.env.ENV === "prod",
    },
  },
  onCallback: async (
    _: SdkError | null,
    ctx: OnCallbackContext,
    __: SessionData | null
  ) => {
    return NextResponse.redirect(
      new URL(ctx.returnTo ?? "/handle-login", process.env.APP_BASE_URL)
    );
  },
});
