export function computePartnerType(
  partner: any,
  withDefaultFn: (value: any, defaultValue?: any, localize?: (x: string) => string) => any
) {
  const chunks = [partner.cso_type_display, partner.partner_type_display].filter(Boolean);

  return withDefaultFn(chunks.length ? chunks.join(' ') : null);
}
