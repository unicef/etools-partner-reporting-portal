function AuthorizedOfficerModalUtils() {

}

AuthorizedOfficerModalUtils.computePostBody = function(selectedFocalPoint) {
    return {
        submitted_by_email: selectedFocalPoint,
    };
};

AuthorizedOfficerModalUtils.computeAuthorizedPartners = function(pd) {
    var partners = (pd.unicef_officers || []).filter(function(partner) {
        return partner.is_authorized_officer && partner.active;
    });
    var formattedPartners = partners.map(function (partner) {
        return {
            value: partner.email,
            title: partner.name + ' ' + partner.title
        };
    });
    return formattedPartners;
};

try {
    module.exports = exports = AuthorizedOfficerModalUtils;
} catch (e) {}
