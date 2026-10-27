import { z, type ZodType } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions<T> = Omit<RequestInit, "body"> & {
  /** Validates the JSON response; the return type is inferred from it. */
  schema: ZodType<T>;
  body?: unknown;
  /** Abort after this many ms (default 10s). */
  timeoutMs?: number;
  /** Retries for network errors and 5xx/429 responses (default 2). */
  retries?: number;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function request<T>(url: string, opts: RequestOptions<T>): Promise<T> {
  const { schema, body, timeoutMs = 10_000, retries = 2, headers, ...init } = opts;

  for (let attempt = 0; ; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...init,
        signal: controller.signal,
        headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...headers },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

      const text = await res.text();
      const json: unknown = text ? JSON.parse(text) : null;

      if (!res.ok) {
        const retryable = res.status >= 500 || res.status === 429;
        if (retryable && attempt < retries) {
          await sleep(2 ** attempt * 300);
          continue;
        }
        throw new ApiError(`${init.method ?? "GET"} ${url} failed with ${res.status}`, res.status, json);
      }

      const parsed = schema.safeParse(json);
      if (!parsed.success) throw new ApiError(`Unexpected response shape from ${url}`, res.status, parsed.error.issues);
      return parsed.data;
    } catch (err) {
      const networkError = err instanceof TypeError || (err instanceof DOMException && err.name === "AbortError");
      if (networkError && attempt < retries) {
        await sleep(2 ** attempt * 300);
        continue;
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}

// Usage
const User = z.object({ id: z.string(), name: z.string(), plan: z.enum(["free", "pro"]) });

export async function getUser(id: string) {
  return request(`/api/users/${id}`, { schema: User }); // → Promise<{ id; name; plan }>
}
