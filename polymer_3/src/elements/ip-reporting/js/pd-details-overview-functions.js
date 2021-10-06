export function computeLoaded(pd) {
    return !!pd.id;
}
export function hasAmendments(pd) {
    return pd.amendments && !!pd.amendments.length;
}
export function computeReportingRequirements(reportingPeriods, dateFormat) {
    const byType = (reportingPeriods || []).reduce(function (acc, curr) {
        const type = curr.report_type.toLowerCase();
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(curr);
        return acc;
    }, {});
    Object.keys(byType).forEach(function (type) {
        byType[type].sort(function (a, b) {
            const dateA = dayjs(a.start_date, dateFormat).toDate();
            const dateB = dayjs(b.start_date, dateFormat).toDate();
            return dateA - dateB;
        });
    });
    return byType;
}
