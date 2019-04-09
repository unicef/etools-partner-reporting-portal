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