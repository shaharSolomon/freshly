/**
 * Israeli mobile numbers as people type them ("050-123-4567", "0501234567",
 * "+972 50 123 4567") to E.164 ("+972501234567"). Returns null if it is not
 * a valid Israeli mobile number.
 */
export function toE164(input: string): string | null {
  let digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+972')) digits = digits.slice(4);
  else if (digits.startsWith('972')) digits = digits.slice(3);
  else if (digits.startsWith('0')) digits = digits.slice(1);
  return /^5\d{8}$/.test(digits) ? `+972${digits}` : null;
}

/** "+972501234567" -> "050-123-4567", for showing the number back to the user. */
export function formatLocal(e164: string): string {
  const local = `0${e164.replace(/^\+972/, '')}`;
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}
