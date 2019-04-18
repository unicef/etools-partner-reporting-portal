const PdDetailsOverviewUtils = require('../../src/elements/ip-reporting/js/pd-details-overview');
const {
    computeLoaded,
    hasAmendments} = PdDetailsOverviewUtils;

describe('PdDetailsOverview functions', () => {
    describe('computedLoaded function', () => {
        const pd = {id: 491};
        const otherPd = {id: ''};
    
        it('returns true when pd object has truthy id value', () => {
            expect(computeLoaded(pd)).toBe(true);
        });
    
        it('returns false when pd object has falsy id value', () => {
            expect(computeLoaded(otherPd)).toBe(false);
        });
    });
    
    describe('hasAmendments function', () => {
        const pd = {'amendments': [667, 451]};
        const otherPd = {'amendments': []};
    
        it('returns true when pd object has amendments array property with items in it', () => {
            expect(hasAmendments(pd)).toBe(true);
        });

        it('returns false when pd object has empty amendments array', () => {
            expect(hasAmendments(otherPd)).toBe(false);
        });
    });
});
