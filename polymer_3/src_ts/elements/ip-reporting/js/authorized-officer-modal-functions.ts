import {GenericObject} from '../../../typings/globals.types';

export function computePostBody(selectedFocalPoint: string) {
  return {
    submitted_by_email: selectedFocalPoint,
  };
}

export function computeAuthorizedPartners(pd: GenericObject) {
  const partners = (pd.unicef_officers || []).filter(function(partner: GenericObject) {
    return partner.is_authorized_officer && partner.active;
  });
  const formattedPartners = partners.map(function(partner: GenericObject) {
    return {
      value: partner.email,
      title: partner.name + ' ' + partner.title
    };
  });
  return formattedPartners;
}
