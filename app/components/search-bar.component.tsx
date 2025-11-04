"use client";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { KeyboardEvent, KeyboardEventHandler, useRef } from "react";

export default function MoviesSearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const value = inputRef.current!.value;
      if (!value.trim()) return;
      router.push(`/search?s=${encodeURIComponent(value)}`);
    }
  };

  return (
    <div className="mb-4 relative">
      <input
        ref={inputRef}
        type="text"
        className="input w-full block pl-7"
        placeholder="Search by title"
        onKeyUp={handleKeyUp}
      />

      <div className="absolute left-2 top-1/2 -translate-y-1/2">
        <SearchIcon size={16} />
      </div>
    </div>
  );
}
