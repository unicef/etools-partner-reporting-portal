declare global {
  interface Window {
    process?: Record<string, any>;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose; // eslint-disable-line
    EtoolsEsmmFitIntoEl: any;
  }
}

import {createStore, compose, applyMiddleware, combineReducers, Reducer, StoreEnhancer} from 'redux';
import thunk, {ThunkMiddleware} from 'redux-thunk';
import {lazyReducerEnhancer} from 'pwa-helpers/lazy-reducer-enhancer.js';

import app, {AppState} from './reducers/app.js';
import {AppAction} from './actions/app.js';

import {UserAction} from './actions/user.js';
import {UserState} from './reducers/user.js';
import {CommonDataAction} from './actions/common-data';
import {CommonDataState} from './reducers/common-data';
import {ActiveLanguageState} from './reducers/active-language.js';

// Overall state extends static states and partials lazy states.
export interface RootState {
  app?: AppState;
  user?: UserState;
  commonData?: CommonDataState;
  activeLanguage?: ActiveLanguageState;
}

// could be more than one action AppAction | OtherAppAction ...
// TODO: remove any and find a way to fix generated ts-lint errors
export type RootAction = AppAction | UserAction | CommonDataAction | any;

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose: <Ext0, Ext1, StateExt0, StateExt1>(
  f1: StoreEnhancer<Ext0, StateExt0>,
  f2: StoreEnhancer<Ext1, StateExt1>
) => StoreEnhancer<Ext0 & Ext1, StateExt0 & StateExt1> = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Initializes the Redux store with a lazyReducerEnhancer (so that you can
// lazily add reducers after the store has been created) and redux-thunk (so
// that you can dispatch async actions). See the "Redux and state management"
// section of the wiki for more details:
// https://github.com/Polymer/pwa-starter-kit/wiki/4.-Redux-and-state-management
export const store = createStore(
  (state) => state as Reducer<RootState, RootAction>,
  devCompose(lazyReducerEnhancer(combineReducers), applyMiddleware(thunk as ThunkMiddleware<RootState, RootAction>))
);

// Initially loaded reducers.
store.addReducers({
  app
});

/**
 * IMPORTANT!
 * For any other reducers use lazy loading like this (in the element that needs the reducer)
 *    import counter from '../reducers/x-reducer.js';
 *    store.addReducers({
 *       xReducer
 *   });
 */

export type ReduxDispatch = typeof store.dispatch;
