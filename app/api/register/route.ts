import { auth0 } from "@/lib/auth0";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Parse the request body
  const session = await auth0.getSession(request);

  console.log("FROM REGISTER", session);

  return NextResponse.json({});

  // return new Response(JSON.stringify(newUser), {
  //   status: 201,
  //   headers: { "Content-Type": "application/json" },
  // });
}
