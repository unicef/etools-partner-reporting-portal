export function computePostBody(selectedFocalPoint) {
    return {
        submitted_by_email: selectedFocalPoint
    };
}
export function computeAuthorizedPartners(pd) {
    const partners = (pd.unicef_officers || []).filter(function (partner) {
        return partner.is_authorized_officer && partner.active;
    });
    const formattedPartners = partners.map(function (partner) {
        return {
            value: partner.email,
            title: partner.name + ' ' + partner.title
        };
    });
    return formattedPartners;
}
