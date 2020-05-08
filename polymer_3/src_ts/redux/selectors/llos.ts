import {createSelector} from 'reselect';
import {programmeDocumentReportsCurrent} from './programmeDocumentReports';
import {RootState} from '../../typings/redux.types';

// App.Selectors.LLOs
export const llosAll = createSelector(
  function(state: RootState) {
    return programmeDocumentReportsCurrent(state);
  },
  function(currentReport) {
    if (!Object.keys(currentReport).length) {
      return [];
    }

    const llos = (currentReport.programme_document.cp_outputs || [])
      .reduce(function(acc: any, curr: any) {
        return acc.concat(curr.ll_outputs);
      }, []);

    return llos.map(function(llo: any) {
      const change = {} as any;

      change.indicator_reports = currentReport.indicator_reports
        .filter(function(report: any) {
          return Number(report.reportable.object_id) === Number(llo.id);
        });

      return Object.assign({}, llo, change);
    });
  }
);
