const PdReportsListUtils = require('../../src/elements/ip-reporting/js/pd-reports-list.js');
const {getLink} = PdReportsListUtils;

describe('PdReportsList getLink function', () => {
    const report = {id: 51, programme_document: {id: 4}};
    const suffix = 'view';
    const baseUrl = '/app/SDN/ip-reporting';

    const buildUrl = (baseUrl, tail) => {
        if (tail.length && tail[0] !== '/') {
            tail = '/' + tail;
        }
        return baseUrl + tail;
    };

    it('builds the correct URL', () => {
        expect(getLink(report, suffix, buildUrl, baseUrl)).toBe('/app/SDN/ip-reporting/pd/4/report/51/view');
    });
});
