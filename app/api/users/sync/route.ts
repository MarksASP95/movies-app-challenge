import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // // Verify the request is from Auth0 (use a secret token)
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.AUTH0_WEBHOOK_SECRET}`) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // const user = await req.json();

    // console.log("USER IS", user);

    console.log("FROM SYNC", await auth0.getSession(req));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
