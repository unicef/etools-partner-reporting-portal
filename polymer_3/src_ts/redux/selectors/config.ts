import {RootState} from '../../etools-prp-common/typings/redux.types';

export const configLoading = function (state: RootState) {
  return state.config.loading;
};
