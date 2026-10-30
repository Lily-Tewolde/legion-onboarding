// The checkout's checks. The card is never sent anywhere: payment is
// simulated ("Use any made-up card number"), so the card only has to look
// like one. Nothing here is a real card check

export type Details = { name: string; email: string; phone: string; consent: boolean };
export type DetailsErrors = Partial<Record<keyof Details, true>>;

export function validateDetails(details: Details): DetailsErrors {
  const errors: DetailsErrors = {};
  if (details.name.trim().split(/\s+/).filter(Boolean).length < 2) errors.name = true;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) errors.email = true;
  if (usPhoneDigits(details.phone) === null) errors.phone = true;
  if (!details.consent) errors.consent = true;
  return errors;
}

// 10 digits, or 11 starting with the US country code 1
export function usPhoneDigits(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return null;
}

export type Card = { number: string; expiry: string; securityCode: string; zip: string };

// "today" is YYYY-MM-DD
export function cardLooksValid(card: Card, today: string): boolean {
  const number = card.number.replace(/[\s-]/g, "");
  if (!/^\d{12,19}$/.test(number)) return false;
  const expiry = card.expiry.replace(/\s/g, "").match(/^(\d{2})\/?(\d{2})$/);
  if (!expiry) return false;
  const month = Number(expiry[1]);
  const year = 2000 + Number(expiry[2]);
  const [thisYear, thisMonth] = today.split("-").map(Number);
  if (month < 1 || month > 12 || year < thisYear || (year === thisYear && month < thisMonth)) return false;
  if (!/^\d{3,4}$/.test(card.securityCode.trim())) return false;
  return /^\d{5}$/.test(card.zip.trim());
}
