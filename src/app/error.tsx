"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-10">
      <p className="font-numeric text-7xl font-bold text-ink-3/80">Oops</p>
      <h1 className="mt-4 text-display font-semibold">A shelf just collapsed.</h1>
      <p className="mt-4 max-w-md text-ink-2">
        Something went wrong loading this page. Try again — if it keeps happening, head back to the
        library.
      </p>
      <div className="mt-8 flex gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-full bg-paper px-5 text-sm font-medium shadow-soft"
        >
          Back to the library
        </Link>
      </div>
    </main>
  );
}
