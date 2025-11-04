"use client";
import { FormEventHandler, useRef, useState } from "react";
import "./login.scss";
import { FormState } from "@/lib/models/general.model";

export default function LoginForm() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = emailRef.current!.value;
    const password = passwordRef.current!.value;

    setFormState("submitting");

    // send


    // handle result
  }



  return (
    <div className="p-8 bg-primary-950 w-xl rounded-md">
      <p className="text-center text-xl font-bold">Login</p>

      <form onSubmit={handleSubmit}>
        <label className="label">Email</label>
        <input ref={emailRef} className="input" type="email" />
        <br />
        <label className="label">Password</label>
        <input ref={passwordRef} className="input" type="password" />

        <br />
        <div className="flex justify-center">
          <button
            disabled={formState === "submitting"}
            type="submit"
            className="btn preset-filled-primary-500"
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
