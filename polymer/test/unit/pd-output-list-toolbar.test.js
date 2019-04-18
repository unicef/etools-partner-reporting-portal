const PdOutPutListToolbarUtils = require('../../src/elements/ip-reporting/js/pd-output-list-toolbar');
const {
    computeShowImportButtons,
    computeRefreshData,
    computeCanRefresh} = PdOutPutListToolbarUtils;

// These functions are from endpoints.html
const _buildUrl = tail => '/api' + tail;

const programmeDocumentReports = (workspaceId) => {
    return _buildUrl('/unicef/' + workspaceId + '/progress-reports/');
};

const programmeDocumentReport = (workspaceId, reportId) => {
    return programmeDocumentReports(workspaceId) + reportId + '/';
};

describe('PdOutputListToolbar computeImportTemplateUrl function', () => {

    const programmeDocumentImportTemplate = (workspaceId, reportId) => {
        return programmeDocumentReport(workspaceId, reportId) + 'export/';
    };

    const workspaceId = 11;
    const reportId = 38;
    
    it('builds the url correctly', () => {
        expect(programmeDocumentImportTemplate(workspaceId, reportId))
            .toBe('/api/unicef/11/progress-reports/38/export/');
    });
});

describe('PdOutputListToolbar computeImportUrl function', () => {
    programmeDocumentImport = (workspaceId, reportId) => {
        return programmeDocumentReport(workspaceId, reportId) + 'import/';
    };

    const workspaceId = 4;
    const reportId = 51;

    it('builds the import url correctly', () => {
        expect(programmeDocumentImport(workspaceId, reportId)).toBe('/api/unicef/4/progress-reports/51/import/');
    });
});

describe('PdOutputListToolbar computePdReportUrl function', () => {
    const locationId = 528;
    const reportId = 491;

    it('builds the report url correctly', () => {
        expect(programmeDocumentReport(locationId, reportId)).toBe('/api/unicef/528/progress-reports/491/');
    });
});

describe('PdOutputListToolbar computeShowImportButton function', () => {
    const doc = {status: 'Ove'};

    it('returns true is object status is not Sub and Acc', () => {
        expect(computeShowImportButtons(doc)).toBe(true);
    });
});

describe('PdOutputListToolbar computeRefreshData function', () => {
    const id = 1138;
    const data = {'report_id': 1138, 'report_type': 'PR'};

    it('should return object with correct id', () => {
        expect(computeRefreshData(id)).toEqual(data);
    });
});

describe('PdOutputListToolbar computeCanRefresh function', () => {
    const report = {'report_type': 'QPR'};
    const doc = {'status': 'Ove'};

    const otherReport = {'report_type': 'SR'};
    const otherDoc = {'status': 'Sig'};

    it('should return true if the objects do not have the specified status/report_type values', () => {
        expect(computeCanRefresh(report, doc)).toBe(true);
    });

    it('should return false if report_type is SR and programmeDocument is truthy', () => {
        expect(computeCanRefresh(otherReport, doc)).toBe(false);
    });

    it('should return false if programmeDocument has status of Sig or Clo', () => {
        expect(computeCanRefresh(report, otherDoc)).toBe(false);
    });
});
