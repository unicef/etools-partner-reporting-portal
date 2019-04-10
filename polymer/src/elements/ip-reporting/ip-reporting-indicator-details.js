function getDataByKey(dataDict, indicator) {
    if (dataDict.details) {
        this.data = dataDict.details[indicator.id];
    }
}

function computeIsClusterApp(name) {
    return name === 'cluster-reporting';
}

function computeParams(boolean) {
    var params = {};

    if (boolean === true) {
        params = Object.assign({}, params, {
            hide_children: 1,
        });
    }

    return params;
}

function computeIndicatorReportsUrl(indicator) {
    var target_indicator_id = indicator.cluster_partner_indicator_reportable_id
        ? indicator.cluster_partner_indicator_reportable_id
        : indicator.id;
    return App.Endpoints.indicatorReports(target_indicator_id) + '?limit=2';
}

function computeHidden(data, loading) {
    return !loading || data.length;
}

function bucketByLocation(data) {
    //API gives us two objects, one for current reporting period and
    //one for previous. We want to create a list of locations, each with a
    //current and/or previous report.
    var locations = {};
    console.log('DATA IN FUNCTION', data);

    if (!data) {
        return [];
    }

    data.forEach(function(report, index) {
        var timeframe = 'current';
        if (index === 1) {
            timeframe = 'previous';
        }

        report.indicator_location_data.forEach(function(locationReport) {
            if (locations[locationReport.location.id]) {
                var toUpdate = locations[locationReport.location.id];
                toUpdate[timeframe] = locationReport;
                toUpdate.reportInfo[timeframe] = report;
                locations[locationReport.location.id] = toUpdate;
            } else {
                var newDict = {reportInfo: {}};
                newDict[timeframe] = locationReport;
                newDict.name = locationReport.location.title;
                newDict.reportInfo[timeframe] = report;
                locations[locationReport.location.id] = newDict;
            }
        });
    });

    var locationList = [];

    Object.keys(locations).forEach(function(i) {
        locationList.push(locations[i]);
    });

    return locationList;
}

module.exports = {
    getDataByKey,
    computeIsClusterApp,
    computeParams,
    computeIndicatorReportsUrl,
    computeHidden
}