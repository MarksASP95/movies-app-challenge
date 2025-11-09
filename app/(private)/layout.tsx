import { auth0 } from "@/lib/auth0";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

const PrivateViewsLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  console.log("AUTH0 SECRET (from layout)", process.env.AUTH0_SECRET);
  const session = await auth0.getSession();

  if (!session) {
    return redirect("/auth/login");
  }

  return (
    <div>
      <div className="px-10 py-2 w-screen flex justify-between">
        <a className="underline decoration-dashed underline-offset-4" href="/">
          Movies
        </a>

        <div className="flex">
          <Link
            className="mr-2 underline decoration-dashed underline-offset-4"
            href="/favorites"
          >
            ❤️ my favorites
          </Link>
          <span className="mr-2">|</span>
          <span className="mr-2">👨🏻 {session.user.email}</span>
          <span className="mr-2">|</span>
          <Link
            className="mr-2 underline decoration-dashed underline-offset-4"
            href="/auth/logout"
          >
            ❌ sign out
          </Link>
        </div>
      </div>
      <div className="px-10 pb-10">{children}</div>
    </div>
  );
};

export default PrivateViewsLayout;
