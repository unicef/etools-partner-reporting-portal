import { createSelector } from 'reselect';
const keys = [
    'partner_contribution_to_date',
    'financial_contribution_to_date',
    'financial_contribution_currency',
    'challenges_in_the_reporting_period',
    'proposed_way_forward',
    'narrative',
    'id'
];
// App.Selectors.ReportInfo
export const reportInfoCurrent = createSelector(function (state) {
    return state.programmeDocumentReports.byPD;
}, function (state) {
    return state.programmeDocuments.current;
}, function (state) {
    return state.programmeDocumentReports.current.id;
}, function (byPD, pdId, reportId) {
    const reports = byPD[pdId];
    if (!reports) {
        return {};
    }
    const report = byPD[pdId].filter(function (report) {
        return Number(report.id) === Number(reportId);
    })[0] || {};
    return keys.reduce(function (acc, curr) {
        acc[curr] = report[curr];
        return acc;
    }, {});
});
