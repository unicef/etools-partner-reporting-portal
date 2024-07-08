import dayjs from 'dayjs';

export function computeLoaded(pd: any) {
  return !!pd.id;
}

export function hasAmendments(pd: any) {
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
      const dateA = dayjs(a.start_date, dateFormat).unix();
      const dateB = dayjs(b.start_date, dateFormat).unix();

      return dateA - dateB;
    });
  });

  return byType;
}
