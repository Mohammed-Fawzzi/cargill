export function toTelHref(phone) {
  const value = String(phone || "").trim();
  if (!value) return "";
  return `tel:${value.replace(/\s+/g, "")}`;
}

export function toWhatsAppHref(phone, message = "") {
  let digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = `20${digits.slice(1)}`;
  const base = `https://wa.me/${digits}`;
  const text = String(message || "").trim();
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}
