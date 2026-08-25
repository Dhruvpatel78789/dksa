export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizePhone(phone: string): string {
  // Strip all non-digits
  const digits = phone.trim().replace(/\D/g, "");

  // Standard Indian mobile number check (10 digits)
  if (digits.length === 10) {
    return `+91${digits}`;
  }

  // Indian mobile number with leading zero (11 digits, e.g. 09876543210)
  if (digits.length === 11 && digits.startsWith("0")) {
    return `+91${digits.slice(1)}`;
  }

  // Indian mobile number with 91 country code (12 digits, e.g. 919876543210)
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  // If it already has some other code or length, prefix with +
  return digits ? `+${digits}` : "";
}
