import {createSelector} from 'reselect';
import {RootState} from '../../typings/redux.types';

//App.Selectors.ProgrammeDocumentReports
export const programmeDocumentReportsAll = createSelector(
  function (state: RootState) {
    return state.programmeDocumentReports.byPD;
  },
  function (state) {
    return state.programmeDocuments.current;
  },
  function (byPD, pdId) {
    return byPD[pdId];
  }
)

export const programmeDocumentReportsCount = createSelector(
  function (state: RootState) {
    return state.programmeDocumentReports.countByPD;
  },
  function (state) {
    return state.programmeDocuments.current;
  },
  function (countByPD, pdId) {
    return countByPD[pdId];
  }
)

export const programmeDocumentReportsCurrent = createSelector(
  function (state: RootState) {
    return state.programmeDocumentReports.byPD;
  },
  function (state) {
    return state.programmeDocuments.current;
  },
  function (state) {
    return state.programmeDocumentReports.current.id;
  },
  function (byPD, pdId, reportId) {
    return (byPD[pdId] || []).filter(function (report: any) {
      return Number(report.id) === Number(reportId);
    })[0] || {};
  }
)
