import Constants from '../../constants';
export class ProgrammeDocumentDetailsState {
    constructor() {
        this.current = {};
    }
}
export const ProgrammeDocumentDetails = (state = { current: {} }, action) => {
    switch (action.type) {
        case Constants.SET_PROGRAMME_DOCUMENT_DETAILS:
            return {
                current: action.pdDetailsData
            };
        case Constants.RESET:
            return {
                current: {}
            };
        default:
            return state;
    }
};
