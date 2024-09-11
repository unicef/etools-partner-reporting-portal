import Constants from '../../etools-prp-common/constants';
import {combineReducers} from 'redux';

export class ProgrammeDocumentReportsState {
  byPD: any = {};
  countByPD: any = {};
  allIds: any[] = [];
  current = {
    id: '',
    mode: '',
    loading: false
  };
}

export const ProgrammeDocumentReports = combineReducers({
  byPD: reportsByPDReducer,
  countByPD: reportsCountByPDReducer,
  allIds: pdIdsReducer,
  current: combineReducers({
    id: idReducer,
    mode: modeReducer,
    loading: loadingReducer
  })
});

function reportsByPDReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_PD_REPORTS:
      return (function () {
        const change: any = {};

        change[action.pdId] = action.data;

        return Object.assign({}, state, change);
      })();

    case Constants.SET_PD_REPORT:
      return (function () {
        const change: any = {};

        // @ts-ignore
        const reports: any[] = state[action.pdId] || [];

        const index = reports.findIndex(function (report) {
          return Number(report.id) === Number(action.data.id);
        });

        if (index === -1) {
          reports.push(action.data);
        } else {
          reports[index] = Object.assign({}, reports[index], action.data);
        }

        change[action.pdId] = reports;

        return Object.assign({}, state, change);
      })();

    case Constants.UPDATE_PD_REPORT:
      return (function () {
        const change: any = {};

        // @ts-ignore
        change[action.pdId] = (state[action.pdId] || []).map(function (report: any) {
          return Number(report.id) === Number(action.reportId) ? Object.assign({}, report, action.data) : report;
        });

        return Object.assign({}, state, change);
      })();

    case Constants.AMEND_REPORTABLE:
      return (function () {
        /**
         * Narrative & status for a given LLO are currently extracted
         * from the first of its indicator reports. Need to update all
         * of them, to be consistent :(
         */

        const change: any = {};

        // @ts-ignore
        change[action.pdId] = state[action.pdId].map(function (report: any) {
          if (Number(report.id) !== Number(action.reportId)) {
            return report;
          }

          return Object.assign({}, report, {
            indicator_reports: report.indicator_reports.map(function (indicatorReport: any) {
              if (Number(indicatorReport.reportable.object_id) !== Number(action.reportableId)) {
                return indicatorReport;
              }

              return Object.assign({}, indicatorReport, action.data);
            })
          });
        });

        return Object.assign({}, state, change);
      })();

    case Constants.RESET:
      return {};

    default:
      return state;
  }
}

function reportsCountByPDReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_PD_REPORTS_COUNT:
      return (function () {
        const change: any = {};

        change[action.pdId] = action.count;

        return Object.assign({}, state, change);
      })();

    default:
      return state;
  }
}

function pdIdsReducer(state: any[] = [], action: any) {
  switch (action.type) {
    case Constants.SET_PD_REPORTS:
      return (function () {
        if (state.indexOf(action.pdId) === -1) {
          return state.concat([action.pdId]);
        }

        return state;
      })();

    case Constants.RESET:
      return [];

    default:
      return state;
  }
}

function idReducer(state = '', action: any) {
  switch (action.type) {
    case Constants.SET_CURRENT_PD_REPORT:
      return action.reportId;

    case Constants.RESET:
      return '';

    default:
      return state;
  }
}

function modeReducer(state = '', action: any) {
  switch (action.type) {
    case Constants.SET_CURRENT_PD_REPORT:
      return action.mode;

    case Constants.RESET:
      return '';

    default:
      return state;
  }
}

function loadingReducer(state = false, action: any) {
  switch (action.type) {
    case Constants.PD_REPORT_LOADING_START:
      return true;

    case Constants.PD_REPORT_LOADING_STOP:
      return false;

    case Constants.RESET:
      return false;

    default:
      return state;
  }
}
