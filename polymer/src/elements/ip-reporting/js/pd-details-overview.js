function PdDetailsOverviewUtils() {

};

PdDetailsOverviewUtils.computeLoaded = function(pd) {
    return !!pd.id;
};

PdDetailsOverviewUtils.hasAmendments = function(pd) {
    return pd.amendments && !!pd.amendments.length;
};

try {
    module.exports = exports = PdDetailsOverviewUtils;
} catch (e) {}
