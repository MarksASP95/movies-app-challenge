"use client";
import { FormState } from "@/lib/models/general.model";
import { useRef, useState } from "react";

export default function RegisterForm() {
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const passwordRepeatRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<FormState>("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = nameRef.current!.value;
    const email = emailRef.current!.value;
    const password = passwordRef.current!.value;
    const passwordRepeat = passwordRepeatRef.current!.value;

    setFormState("submitting");

    // send

    // handle result
  }

  return (
    <div className="p-8 bg-primary-950 w-xl rounded-md">
      <p className="text-center text-xl font-bold">Register</p>

      <form onSubmit={handleSubmit}>
        <label className="label">Name</label>
        <input ref={nameRef} className="input" type="text" />
        <br />

        <label className="label">Email</label>
        <input ref={emailRef} className="input" type="email" />
        <br />

        <label className="label">Password</label>
        <input ref={passwordRef} className="input" type="password" />
        <br />

        <label className="label">Confirm password</label>
        <input ref={passwordRepeatRef} className="input" type="password" />
        <br />

        <div className="flex justify-center">
          <button
            disabled={formState === "submitting"}
            type="submit"
            className="btn preset-filled-primary-500"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
