import { createSelector } from 'reselect';
import { programmeDocumentReportsCurrent } from './programmeDocumentReports';
// App.Selectors.LLOs
export const llosAll = createSelector(function (state) {
    return programmeDocumentReportsCurrent(state);
}, function (currentReport) {
    if (!Object.keys(currentReport).length) {
        return [];
    }
    const llos = (currentReport.programme_document.cp_outputs || []).reduce(function (acc, curr) {
        return acc.concat(curr.ll_outputs);
    }, []);
    return llos.map(function (llo) {
        const change = {};
        change.indicator_reports = currentReport.indicator_reports.filter(function (report) {
            return Number(report.reportable.object_id) === Number(llo.id);
        });
        return Object.assign({}, llo, change);
    });
});
