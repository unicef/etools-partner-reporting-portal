import {optionsFromChoices} from "../helpers/options";
import {OPTIONS} from "../actions";

export default function options(state = {}, action) {
    switch (action.type) {
        case OPTIONS:
            let options = {};

            action.fields.forEach(field => {
                options[field] = optionsFromChoices(action.data.actions.POST[field].choices)
            });

            return options;
        default:
            return state;
    }
}

