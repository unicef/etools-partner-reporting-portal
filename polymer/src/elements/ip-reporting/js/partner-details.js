function PartnerDetailsUtils() {

}

PartnerDetailsUtils.computePartnerType = function(partner, withDefaultFn) {
    var chunks = [
        partner.cso_type_display,
        partner.partner_type_display,
    ].filter(Boolean);

    return withDefaultFn(chunks.length ? chunks.join(' ') : null);
};

try {
    module.exports = exports = PartnerDetailsUtils;
} catch (e) {}
