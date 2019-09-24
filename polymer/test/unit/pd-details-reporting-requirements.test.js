const PdDetailsReportingRequirementsUtils = require(
    '../../src/elements/ip-reporting/js/pd-details-reporting-requirements');
const {getReportName} = PdDetailsReportingRequirementsUtils;

describe('PdDetailsReportingRequirements getReportName function', () => {
    const type = 'QPR';
    const index = 1;

    const localizeDefinitions = {
        qpr: 'QPR (Quarterly Progress Report)',
    };
    const localize = length => (localizeDefinitions[length]);

    it('returns the correctly-built name from the given type and index', () => {
        expect(getReportName(type, index, localize)).toBe('QPR2');
    });
});
