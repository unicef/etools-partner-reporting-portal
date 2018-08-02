import switchPortal from "./switchPortal";
import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import userProfile from "./userProfile";
import expandedRowIds from "./expandedRowIds";

const reducers = combineReducers({
    portal: switchPortal,
    form: formReducer,
    user: userProfile,
    expandedRowIds
});

export default reducers;