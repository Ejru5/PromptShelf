import { useCallback, useEffect, useRef, useState } from "react";

type User = { id: string; name: string; email: string };

type Props = { userId: string; onLoaded?: (user: User) => void };

/**
 * Was: class UserCard extends React.Component — componentDidMount,
 * componentDidUpdate and componentWillUnmount merged into one effect.
 */
export function UserCard({ userId, onLoaded }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep the latest callback without re-running the fetch when it changes.
  const onLoadedRef = useRef(onLoaded);
  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/users/${userId}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json() as Promise<User>;
      })
      .then((data) => {
        setUser(data);
        onLoadedRef.current?.(data);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    // Replaces componentWillUnmount + the stale-response bug on fast userId changes.
    return () => controller.abort();
  }, [userId]);

  const copyEmail = useCallback(() => {
    if (user) void navigator.clipboard.writeText(user.email);
  }, [user]);

  if (loading) return <p aria-busy="true">Loading…</p>;
  if (error) return <p role="alert">{error}</p>;
  if (!user) return null;

  return (
    <article>
      <h2>{user.name}</h2>
      <button type="button" onClick={copyEmail}>
        Copy {user.email}
      </button>
    </article>
  );
}
