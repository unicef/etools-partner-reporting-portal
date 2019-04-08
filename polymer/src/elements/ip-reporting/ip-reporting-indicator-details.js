function getDataByKey(dataDict) {
    if (dataDict.details) {
        this.data = dataDict.details[this.indicator.id];
    }
    console.log('IS THIS ON?????');
}
