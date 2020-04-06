import {GenericObject} from '../../../typings/globals.types';

export function computePartnerType(partner: GenericObject, withDefaultFn: Function) {
  const chunks = [
    partner.cso_type_display,
    partner.partner_type_display
  ].filter(Boolean);

  return withDefaultFn(chunks.length ? chunks.join(' ') : null);
}
