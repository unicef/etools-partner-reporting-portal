import {GenericObject} from '../../../typings/globals.types';
declare const moment: any;

export function computeLoaded(pd: GenericObject) {
  return !!pd.id;
}

export function hasAmendments(pd: GenericObject) {
  return pd.amendments && !!pd.amendments.length;
}

export function computeReportingRequirements(reportingPeriods: any[], dateFormat: string) {
  const byType = (reportingPeriods || []).reduce(function (acc, curr) {
    const type = curr.report_type.toLowerCase();

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(curr);

    return acc;
  }, {});

  Object.keys(byType).forEach(function (type) {
    byType[type].sort(function (a: any, b: any) {
      const dateA = moment(a.start_date, dateFormat).toDate();
      const dateB = moment(b.start_date, dateFormat).toDate();

      return dateA - dateB;
    });
  });

  return byType;
}
