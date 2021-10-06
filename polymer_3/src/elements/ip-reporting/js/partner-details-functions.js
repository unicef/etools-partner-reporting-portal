export function computePartnerType(partner, withDefaultFn) {
    const chunks = [partner.cso_type_display, partner.partner_type_display].filter(Boolean);
    return withDefaultFn(chunks.length ? chunks.join(' ') : null);
}
