export function computeViewData(data) {
    return data.filter(function (item) {
        return Boolean(item.indicator_reports.length);
    });
}
