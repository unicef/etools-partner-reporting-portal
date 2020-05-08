import {RootState} from '../../typings/redux.types';

// use instea of App.Selectors.Config
export const configClusterTypes = function(state: RootState) {
  return state.config.data.CLUSTER_TYPE_CHOICES;
};

export const configLoading = function(state: RootState) {
  return state.config.loading;
};
