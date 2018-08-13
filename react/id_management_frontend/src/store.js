import {applyMiddleware, createStore} from 'redux';
import reducers from "./reducers/reducers";
import thunkMiddleware from 'redux-thunk';

const store = createStore(reducers, applyMiddleware(
    thunkMiddleware
));

export default store;

