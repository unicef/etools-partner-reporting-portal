const PartnerDetailsUtils = require('../../src/elements/ip-reporting/js/partner-details');
const {computePartnerType} = PartnerDetailsUtils;

describe('PartnerDetails functions', () => {
    describe('computePartnerType function', () => {
        const withDefault = (value, defaultValue) => {
            if (typeof defaultValue === 'undefined') {
                defaultValue = '...';
            }
    
            return value == null /* undefinded & null */ ? // jshint ignore:line
                defaultValue : value;
        };

        const partner = {
            cso_type_display: 'Volunteer',
            partner_type_display: 'Fire Department'
        };

        it('builds the correct partner name', () => {
            expect(computePartnerType(partner, withDefault)).toBe('Volunteer Fire Department');
        });
    });
});
