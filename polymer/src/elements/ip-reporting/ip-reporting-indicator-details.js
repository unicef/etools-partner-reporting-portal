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