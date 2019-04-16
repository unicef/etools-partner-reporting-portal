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
