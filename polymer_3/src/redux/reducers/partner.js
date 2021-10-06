import Constants from '../../etools-prp-common/constants';
export class PartnerState {
    constructor() {
        this.current = {};
    }
}
const INITIAL_STATE = new PartnerState();
export const Partner = (state = INITIAL_STATE, action) => {
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
