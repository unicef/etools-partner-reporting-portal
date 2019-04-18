function PdDetailsOverviewUtils() {

};

PdDetailsOverviewUtils.computeLoaded = function(pd) {
    return !!pd.id;
};

try {
    module.exports = exports = PdDetailsOverviewUtils;
} catch (e) {}
