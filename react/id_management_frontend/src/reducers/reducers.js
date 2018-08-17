import switchPortal from "./switchPortal";
import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import userProfile from "./userProfile";
import expandedRowIds from "./expandedRowIds";
import workspaces from "./workspaces";
import clusters from "./clusters";
import options from "./options";
import partners from "./partners";
import partnerDetails from "./partnerDetails";
import error from "./error";
import fetch from "./fetch";
import {otherAo} from "../actions";

const reducers = combineReducers({
    portal: switchPortal,
    form: formReducer,
    user: userProfile,
    expandedRowIds,
    workspaces,
    clusters,
    options,
    partners,
    partnerDetails,
    error,
    fetch,
    otherAo
});

export default reducers;