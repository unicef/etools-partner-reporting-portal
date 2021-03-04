export function computeViewData(data: any[]) {
  return data.filter(function (item) {
    return Boolean(item.indicator_reports.length);
  });
}
