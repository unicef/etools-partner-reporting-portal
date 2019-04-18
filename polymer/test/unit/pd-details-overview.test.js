const PdDetailsOverviewUtils = require('../../src/elements/ip-reporting/js/pd-details-overview');
const {computeLoaded} = PdDetailsOverviewUtils;

describe('PdDetailsOverview computedLoaded function', () => {
    const pd = {id: 491};
    const otherPd = {id: ''};

    it('returns true when pd object has truthy id value', () => {
        expect(computeLoaded(pd)).toBe(true);
    });

    it('returns false when pd object has falsy id value', () => {
        expect(computeLoaded(otherPd)).toBe(false);
    });
});
