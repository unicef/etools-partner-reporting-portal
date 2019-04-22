function PdDetailsOverviewUtils() {

}

PdDetailsOverviewUtils.computeLoaded = function(pd) {
    return !!pd.id;
};

PdDetailsOverviewUtils.hasAmendments = function(pd) {
    return pd.amendments && !!pd.amendments.length;
};

PdDetailsOverviewUtils.computeReportingRequirements = function(reportingPeriods, momentFn, dateFormat) {
    var byType = (reportingPeriods || []).reduce(function (acc, curr) {
        var type = curr.report_type.toLowerCase();

        if (!acc[type]) {
            acc[type] = [];
        }

        acc[type].push(curr);

        return acc;
    }, {});

    Object.keys(byType).forEach(function (type) {
        byType[type].sort(function (a, b) {
            var dateA = momentFn(a.start_date, dateFormat).toDate();
            var dateB = momentFn(b.start_date, dateFormat).toDate();

            return dateA - dateB;
        });
    });

    return byType;
};

try {
    module.exports = exports = PdDetailsOverviewUtils;
} catch (e) {}
