import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-10">
      <p className="font-numeric text-7xl font-bold text-ink-3/80">404</p>
      <h1 className="mt-4 text-display font-semibold">This shelf is empty.</h1>
      <p className="mt-4 max-w-md text-ink-2">
        The page you&apos;re looking for has been moved, renamed, or never existed.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-ink px-5 text-sm font-medium text-paper"
      >
        Back to the library
      </Link>
      <p className="mt-6 -rotate-3 font-hand text-2xl text-ink-3">happens to the best of us ↖</p>
    </main>
  );
}
