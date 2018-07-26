import switchPortal from "./switchPortal";
import { combineReducers } from 'redux'

const reducers = combineReducers({
    portal: switchPortal
});

export default reducers;