/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {Reducer} from 'redux';
import {UPDATE_ROUTE_DETAILS, UPDATE_DRAWER_STATE} from '../actions/app';
import {RootAction} from '../store';
import {RouteDetails} from '../../routing/router';

export interface AppState {
  routeDetails: RouteDetails;
  drawerOpened: boolean;
}

const INITIAL_STATE: AppState = {
  routeDetails: {} as RouteDetails,
  drawerOpened: false
};

const app: Reducer<AppState, RootAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_ROUTE_DETAILS:
      return {
        ...state,
        routeDetails: action.routeDetails
      };
    case UPDATE_DRAWER_STATE:
      return {
        ...state,
        drawerOpened: action.opened
      };
    default:
      return state;
  }
};

export default app;
