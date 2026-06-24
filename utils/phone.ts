export function normalizePhone(phone: string): string {
  return phone.trim().replace(/[\s-]/g, "");
}

export function isValidPhone(phone: string): boolean {
  const normalizedPhone = normalizePhone(phone);
  return /^1[3-9]\d{9}$/.test(normalizedPhone) || /^\+[1-9]\d{7,14}$/.test(normalizedPhone);
}
