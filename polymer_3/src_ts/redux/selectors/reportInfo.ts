import {RootState} from '../../typings/redux.types';
import {createSelector} from 'reselect';

var keys = [
  'partner_contribution_to_date',
  'challenges_in_the_reporting_period',
  'proposed_way_forward',
  'narrative',
  'id',
];


//App.Selectors.ReportInfo
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
    let reports = byPD[pdId];
    let report: any;

    if (!reports) {
      return {};
    }

    report = byPD[pdId].filter(function (report: any) {
      return Number(report.id) === Number(reportId);
    })[0] || {};

    return keys.reduce(function (acc, curr) {
      acc[curr] = report[curr];

      return acc;
    }, {});
  }
)
