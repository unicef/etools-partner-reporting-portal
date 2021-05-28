import {GenericObject} from '../../etools-prp-common/typings/globals.types';
import Constants from '../../etools-prp-common/constants';

export class PartnerState {
  current: GenericObject = {};
}

const INITIAL_STATE = new PartnerState();

export const Partner = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case Constants.SET_PARTNER:
      return {
        current: Object.assign({}, action.partnerData)
      };

    case Constants.RESET:
      return new PartnerState();

    default:
      return state;
  }
};
