import {RootState} from '../../typings/redux.types';
import {createSelector} from 'reselect';

// App.Selectors.ClusterIndicatorReports
export const clusterIndicatorsReportsAll = createSelector(
  function (state: RootState) {
    return state.clusterIndicatorReports.allIds as [];
  },
  function (state: RootState) {
    return state.clusterIndicatorReports.byId;
  },
  function (ids: [], byId: any) {
    return ids.map(function (id) {
      return byId[id];
    });
  }
);
