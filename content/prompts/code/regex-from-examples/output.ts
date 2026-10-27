/**
 * UK postcode (outward + inward code), case-insensitive, optional single space.
 *
 *   ^                       start
 *   ([A-Z]{1,2}\d[A-Z\d]?)  outward code: 1–2 letters, a digit, optional letter/digit
 *   \s?                     optional space
 *   (\d[A-Z]{2})            inward code: a digit then two letters
 *   $                       end
 */
export const UK_POSTCODE = /^([A-Z]{1,2}\d[A-Z\d]?)\s?(\d[A-Z]{2})$/i;

/** Normalise to "OUTWARD INWARD" in upper case, or null if invalid. */
export function normalisePostcode(input: string): string | null {
  const match = input.trim().match(UK_POSTCODE);
  return match ? `${match[1]} ${match[2]}`.toUpperCase() : null;
}

// ✅ should match
const valid = ["SW1A 1AA", "M1 1AE", "B33 8TH", "cr2 6xh", "DN551PT", "EC1A1BB"];
// ❌ should not match
const invalid = ["SW1A 1A", "12345", "ABC 123", "M1  1AE", "W1A-0AX", ""];

for (const s of valid) console.assert(UK_POSTCODE.test(s), `expected match: ${s}`);
for (const s of invalid) console.assert(!UK_POSTCODE.test(s), `expected no match: ${s}`);

console.log(normalisePostcode(" dn551pt ")); // "DN55 1PT"
