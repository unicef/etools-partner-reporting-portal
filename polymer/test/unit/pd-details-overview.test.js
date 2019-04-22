const PdDetailsOverviewUtils = require('../../src/elements/ip-reporting/js/pd-details-overview');
const moment = require('../../bower_components/moment/min/moment.min.js');
const {
    computeLoaded,
    hasAmendments,
    computeReportingRequirements} = PdDetailsOverviewUtils;

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

    describe('computeReportingRequirements function', () => {
        const reportingPeriod = [
            {'report_type': 'QPR', 'start_date': '21-Jun-2019'},
            {'report_type': 'QPR', 'start_date': '01-Jan-2019'},
            {'report_type': 'SR', 'start_date': '30-Nov-2019'}
        ];

        const byType = {
            'qpr': [
                {'report_type': 'QPR', 'start_date': '01-Jan-2019'},
                {'report_type': 'QPR', 'start_date': '21-Jun-2019'}
            ],
            'sr': [{'report_type': 'SR', 'start_date': '30-Nov-2019'}]
        };

        const AppSettings = {
            dateFormat: 'DD-MMM-YYYY'
        };

        it('returns a new object with items in chronological order by start_date', () => {
            expect(computeReportingRequirements(reportingPeriod, moment, AppSettings.dateFormat)).toEqual(byType);
        });
    });
});
