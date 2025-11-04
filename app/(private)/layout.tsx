import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import React from "react";
import { MovieService } from "../services/movie.service";

const PrivateViewsLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div>
      <div className="px-10 py-2 w-screen flex justify-between">
        <a className="underline decoration-dashed underline-offset-4" href="/">
          Movies
        </a>

        <div className="flex">
          <a
            className="mr-2 underline decoration-dashed underline-offset-4"
            href="/favorites"
          >
            ❤️ my favorites
          </a>
          <span className="mr-2">|</span>
          <span className="mr-2">👨🏻 {session.user.email}</span>
          <span className="mr-2">|</span>
          <a
            className="mr-2 underline decoration-dashed underline-offset-4"
            href="/auth/logout"
          >
            ❌ sign out
          </a>
        </div>
      </div>
      <div className="px-10 pb-10">{children}</div>
    </div>
  );
};

export default PrivateViewsLayout;
