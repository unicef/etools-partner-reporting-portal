import { createSelector } from 'reselect';
// App.Selectors.ClusterIndicatorReports
export const clusterIndicatorsReportsAll = createSelector(function (state) {
    return state.clusterIndicatorReports.allIds;
}, function (state) {
    return state.clusterIndicatorReports.byId;
}, function (ids, byId) {
    return ids.map(function (id) {
        return byId[id];
    });
});
