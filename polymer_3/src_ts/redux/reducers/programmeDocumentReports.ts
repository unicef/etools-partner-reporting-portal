import Constants from '../../constants';
import {combineReducers} from 'redux';
import {GenericObject} from '../../typings/globals.types';

export class ProgrammeDocumentReportsState {
  byPD: GenericObject = {};
  countByPD: GenericObject = {};
  allIds = [];
  current = {
    id: '',
    mode: '',
    loading: false,
  };
}

export const ProgrammeDocumentReports = combineReducers({
  byPD: reportsByPDReducer,
  countByPD: reportsCountByPDReducer,
  allIds: pdIdsReducer,
  current: combineReducers({
    id: idReducer,
    mode: modeReducer,
    loading: loadingReducer,
  }),
});

function reportsByPDReducer(state = {}, action: any) {
  switch (action.type) {
    case Constants.SET_PD_REPORTS:
      return (function () {
        let change = {};

        change[action.pdId] = action.data;

        return Object.assign({}, state, change);
      }());

    case Constants.SET_PD_REPORT:
      return (function () {
        let change = {};

        let reports = state[action.pdId] || [];

        let index = reports.findIndex(function (report) {
          return Number(report.id) === Number(action.data.id);
        });

        if (index === -1) {
          reports.push(action.data);
        } else {
          reports[index] = Object.assign({}, reports[index], action.data);
        }

        change[action.pdId] = reports;

        return Object.assign({}, state, change);
      }());

    case Constants.UPDATE_PD_REPORT:
      return (function () {
        let change = {};

        change[action.pdId] = (state[action.pdId] || []).map(function (report) {
          return Number(report.id) === Number(action.reportId) ?
            Object.assign({}, report, action.data) : report;
        });

        return Object.assign({}, state, change);
      }());

    case Constants.AMEND_REPORTABLE:
      return (function () {
        /**
         * Narrative & status for a given LLO are currently extracted
         * from the first of its indicator reports. Need to update all
         * of them, to be consistent :(
         */

        let change = {};

        change[action.pdId] = state[action.pdId].map(function (report) {
          if (Number(report.id) !== Number(action.reportId)) {
            return report;
          }

          return Object.assign({}, report, {
            indicator_reports: report.indicator_reports.map(function (indicatorReport) {
              if (
                Number(indicatorReport.reportable.object_id) !==
                Number(action.reportableId)
              ) {
                return indicatorReport;
              }

              return Object.assign({}, indicatorReport, action.data);
            }),
          });
        });

        return Object.assign({}, state, change);
      }());

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
        let change = {};

        change[action.pdId] = action.count;

        return Object.assign({}, state, change);
      }());

    default:
      return state;
  }
}

function pdIdsReducer(state = [], action: any) {
  switch (action.type) {
    case Constants.SET_PD_REPORTS:
      return (function () {
        if (state.indexOf(action.pdId) === -1) {
          return state.concat([action.pdId]);
        }

        return state;
      }());

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
