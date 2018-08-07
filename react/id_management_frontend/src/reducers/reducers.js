import switchPortal from "./switchPortal";
import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import userProfile from "./userProfile";
import expandedRowIds from "./expandedRowIds";
import workspaces from "./workspaces";
import clusters from "./clusters";
import options from "./options";

const reducers = combineReducers({
    portal: switchPortal,
    form: formReducer,
    user: userProfile,
    expandedRowIds,
    workspaces,
    clusters,
    options
});

export default reducers;