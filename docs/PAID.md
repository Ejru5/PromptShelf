# Turning on paid prompts

Everything on Promptshelf is free today, but the code is ready for a paid plan.

## What already exists

- **`access` field** on every prompt and collection (`free` | `premium`, default `free`).
  Set `access: premium` in a `prompt.md` or collection file to mark it.
- **Server-side gating** — `src/lib/access.ts`:
  - `getViewer()` → who's looking (anonymous free viewer today).
  - `canAccess(item, viewer)` → `true` for free items, or for `pro` viewers.
  - `redactPrompt(prompt)` → removes the prompt text, excerpt and tips. Results stay visible
    (they're the proof that sells the prompt).
- **The detail page** renders `PremiumGate` instead of the copy workbench when access is denied.
  The full template is never sent to the browser.
- **Cards, search, OG images** use `publicExcerpt()` so premium text can't leak there either.
- **Status line** on cards shows "Premium" instead of "Free".

## What you'll add when you launch

1. **Auth** — e.g. Supabase Auth, Clerk or Auth.js. Implement `getViewer()` to read the
   session and return `{ id, plan }`.
   - Reading cookies makes a route dynamic. Keep the page shell static and move the gated
     part (workbench vs. gate) into a component wrapped in `<Suspense>` that calls
     `getViewer()`. See `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`.
2. **Payments** — Stripe Checkout + a webhook that sets the user's plan to `pro` in your database.
3. **Upgrade CTA** — replace the "Premium is coming soon" pill in
   `src/components/prompt/detail/premium-gate.tsx` with a link to checkout.
4. **My shelf sync (optional)** — `src/lib/saved.ts` stores saves in the browser. Swap its
   read/write for API calls behind the same `useSaved()` hook to sync across devices.
5. **Copy counts (optional)** — `src/lib/track.ts` already emits `prompt_copy` events; record them
   in your database to show "most copied" sorting.
