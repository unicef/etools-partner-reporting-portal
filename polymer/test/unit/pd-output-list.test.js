const PdOutputListUtils = require('../../src/elements/ip-reporting/js/pd-output-list');
const {computeViewData} = PdOutputListUtils;

describe('PdOutputList computeViewData function', () => {
    const data = [
        {indicator_reports: ['1', '2']},
        {indicator_reports: ['3', '4']}
    ];

    const moreData = [
        {indicator_reports: ['1', '2']},
        {indicator_reports: []},
        {indicator_reports: ['5', '6']}
    ];

    const moreResult = [
        {indicator_reports: ['1', '2']},
        {indicator_reports: ['5', '6']}
    ];

    it('returns all items that have an indicator_reports array with items in it', () => {
        expect(computeViewData(data)).toEqual(data);
    });

    it('does not return items that have an empty indicator_reports array', () => {
        expect(computeViewData(moreData)).toEqual(moreResult);
    });
});
