import switchPortal from "./switchPortal";
import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'

const reducers = combineReducers({
    portal: switchPortal,
    form: formReducer
});

export default reducers;