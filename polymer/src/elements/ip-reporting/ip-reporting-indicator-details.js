function getDataByKey(dataDict, indicator) {
    if (dataDict.details) {
        this.data = dataDict.details[indicator.id];
    }
}

function computeIsClusterApp(name) {
    return name === 'cluster-reporting';
}