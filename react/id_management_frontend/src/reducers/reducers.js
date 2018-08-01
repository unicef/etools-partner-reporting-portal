import switchPortal from "./switchPortal";
import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import userProfile from "./userProfile";

const reducers = combineReducers({
    portal: switchPortal,
    form: formReducer,
    user: userProfile
});

export default reducers;