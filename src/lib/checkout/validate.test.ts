import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { cardErrors, cardLooksValid, usPhoneDigits, validateDetails } from "./validate";

const details = { name: "Sam Rivera", email: "sam@example.com", phone: "(512) 555-0142", consent: true };
const card = { number: "4242 4242 4242 4242", expiry: "12/28", securityCode: "123", zip: "78701" };

describe("checkout details", () => {
  it("accepts a name, an email, a US phone and consent", () => {
    assert.deepEqual(validateDetails(details), {});
  });

  it("accepts a one-word name, but not an empty or over-long one", () => {
    assert.deepEqual(validateDetails({ ...details, name: "Cher" }), {});
    assert.deepEqual(validateDetails({ ...details, name: "  " }), { name: true });
    assert.deepEqual(validateDetails({ ...details, name: "a".repeat(101) }), { name: true });
  });

  it("flags each missing or malformed answer", () => {
    assert.deepEqual(validateDetails({ name: "", email: "sam@", phone: "555-0142", consent: false }), {
      name: true,
      email: true,
      phone: true,
      consent: true,
    });
  });

  it("reads 10-digit US numbers, with or without the leading 1", () => {
    assert.equal(usPhoneDigits("+1 512 555 0142"), "5125550142");
    assert.equal(usPhoneDigits("512-555-0142"), "5125550142");
    assert.equal(usPhoneDigits("555-0142"), null);
  });
});

describe("the made-up card", () => {
  it("accepts any card-shaped number with a future expiry", () => {
    assert.equal(cardLooksValid(card, "2026-10-28"), true);
  });

  it("rejects a past expiry, a short number, a bad security code or ZIP", () => {
    assert.equal(cardLooksValid({ ...card, expiry: "09/26" }, "2026-10-28"), false);
    assert.equal(cardLooksValid({ ...card, number: "4242" }, "2026-10-28"), false);
    assert.equal(cardLooksValid({ ...card, securityCode: "12" }, "2026-10-28"), false);
    assert.equal(cardLooksValid({ ...card, zip: "787" }, "2026-10-28"), false);
  });

  it("names each card field's problem", () => {
    assert.deepEqual(cardErrors({ number: "", expiry: "13/28", securityCode: "1", zip: "7870" }, "2026-10-28"), {
      number: "missing",
      expiry: true,
      securityCode: true,
      zip: true,
    });
    assert.deepEqual(cardErrors({ ...card, number: "1234" }, "2026-10-28"), { number: "unusable" });
    assert.deepEqual(cardErrors(card, "2026-10-28"), {});
  });
});
