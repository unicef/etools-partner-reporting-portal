export function computePostBody(selectedFocalPoint: string) {
  return {
    submitted_by_email: selectedFocalPoint
  };
}

export function computeAuthorizedPartners(pd: any) {
  const partners = (pd.unicef_officers || []).filter(function (partner: any) {
    return partner.is_authorized_officer && partner.active;
  });
  const formattedPartners = partners.map(function (partner: any) {
    return {
      value: partner.email,
      title: partner.name + ' ' + partner.title
    };
  });
  return formattedPartners;
}
