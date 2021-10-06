// use instea of App.Selectors.Config
export const configClusterTypes = function (state) {
    return state.config.data.CLUSTER_TYPE_CHOICES;
};
export const configLoading = function (state) {
    return state.config.loading;
};
