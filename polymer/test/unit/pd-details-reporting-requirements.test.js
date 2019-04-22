const PdDetailsReportingRequirementsUtils = require(
    '../../src/elements/ip-reporting/js/pd-details-reporting-requirements');
const {getReportName} = PdDetailsReportingRequirementsUtils;

describe('PdDetailsReportingRequirements getReportName function', () => {
    const type = 'QPR';
    const index = 1;

    it('returns the correctly-built name from the given type and index', () => {
        expect(getReportName(type, index)).toBe('QPR2');
    });
});
