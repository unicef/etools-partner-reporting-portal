function PdOutputListUtils() {

}

PdOutputListUtils.computeViewData = function (data) {
    return data.filter(function (item) {
        return Boolean(item.indicator_reports.length);
    });
};

try {
    module.exports = exports = PdOutputListUtils;
} catch (e) {}
