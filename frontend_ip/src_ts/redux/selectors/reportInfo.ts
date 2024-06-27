import {RootState} from '../../typings/redux.types';
import {createSelector} from 'reselect';

const keys = [
  'partner_contribution_to_date',
  'financial_contribution_to_date',
  'financial_contribution_currency',
  'challenges_in_the_reporting_period',
  'proposed_way_forward',
  'narrative',
  'final_review',
  'id'
];

// App.Selectors.ReportInfo
export const reportInfoCurrent = createSelector(
  function (state: RootState) {
    return state.programmeDocumentReports.byPD;
  },
  function (state: RootState) {
    return state.programmeDocuments.current;
  },
  function (state: RootState) {
    return state.programmeDocumentReports.current.id;
  },
  function (byPD: any, pdId: any, reportId: any) {
    const reports = byPD[pdId];

    if (!reports) {
      return {};
    }

    const report =
      byPD[pdId].filter(function (report: any) {
        return Number(report.id) === Number(reportId);
      })[0] || {};

    return keys.reduce(function (acc: any, curr: string) {
      acc[curr] = report[curr];

      return acc;
    }, {});
  }
);
