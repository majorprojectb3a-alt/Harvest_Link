import { parsePhoneNumberFromString } from "libphonenumber-js";


export function toE164(rawNumber, defaultCountry = "IN") {
  if (!rawNumber) return null;
  const pn = parsePhoneNumberFromString(rawNumber, defaultCountry);
  if (!pn || !pn.isValid()) return null;
  return pn.format("E.164"); // +919876543210
}