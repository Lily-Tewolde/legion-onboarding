// The checkout's checks. The card is never sent anywhere: payment is
// simulated ("Use any made-up card number"), so the card only has to look
// like one. Nothing here is a real card check

export type Details = { name: string; email: string; phone: string; consent: boolean };

// One word is a name too (copy audit, Oct 29), up to 100 characters
export const MAX_NAME = 100;
export type DetailsErrors = Partial<Record<keyof Details, true>>;

export function validateDetails(details: Details): DetailsErrors {
  const errors: DetailsErrors = {};
  const name = details.name.trim();
  if (!name || name.length > MAX_NAME) errors.name = true;
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

// Each card field's problem (copy audit, Oct 29). An empty number is
// "missing"; one that isn't 12 to 19 digits is "unusable", which gets "We
// couldn't save this card". "today" is YYYY-MM-DD
export type CardErrors = Partial<{ number: "missing" | "unusable"; expiry: true; securityCode: true; zip: true }>;

export function cardErrors(card: Card, today: string): CardErrors {
  const errors: CardErrors = {};
  const number = card.number.replace(/[\s-]/g, "");
  if (!number) errors.number = "missing";
  else if (!/^\d{12,19}$/.test(number)) errors.number = "unusable";
  if (!expiryLooksValid(card.expiry, today)) errors.expiry = true;
  if (!/^\d{3,4}$/.test(card.securityCode.trim())) errors.securityCode = true;
  if (!/^\d{5}$/.test(card.zip.trim())) errors.zip = true;
  return errors;
}

export const cardLooksValid = (card: Card, today: string) => Object.keys(cardErrors(card, today)).length === 0;

function expiryLooksValid(value: string, today: string): boolean {
  const expiry = value.replace(/\s/g, "").match(/^(\d{2})\/?(\d{2})$/);
  if (!expiry) return false;
  const month = Number(expiry[1]);
  const year = 2000 + Number(expiry[2]);
  const [thisYear, thisMonth] = today.split("-").map(Number);
  return month >= 1 && month <= 12 && (year > thisYear || (year === thisYear && month >= thisMonth));
}
