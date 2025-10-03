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
      const dateA =
        a.report_type === 'SR' ? dayjs(a.due_date, dateFormat).unix() : dayjs(a.start_date, dateFormat).unix();
      const dateB =
        b.report_type === 'SR' ? dayjs(b.due_date, dateFormat).unix() : dayjs(b.start_date, dateFormat).unix();

      return dateA - dateB;
    });
  });

  return byType;
}
