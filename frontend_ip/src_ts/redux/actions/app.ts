/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {Action, ActionCreator} from 'redux';
// import {UPDATE_ROUTE_DETAILS} from './actionsConstants';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import Constants from '../../etools-prp-common/constants.js';

export interface AppActionUpdateDrawerState extends Action<'UPDATE_DRAWER_STATE'> {
  opened: boolean;
}
export interface AppActionShowToast extends Action<'SHOW_TOAST'> {
  active: boolean;
  message: string;
  showCloseBtn: boolean;
}

export type AppActionCloseToast = Action<'CLOSE_TOAST'>;
export interface AppActionUpdateRouteDetails extends Action<'UPDATE_ROUTE_DETAILS'> {
  routeDetails: EtoolsRouteDetails;
}
export type AppAction =
  | AppActionUpdateDrawerState
  | AppActionShowToast
  | AppActionCloseToast
  | AppActionUpdateRouteDetails;

export const updateStoreRouteDetails: ActionCreator<AppActionUpdateRouteDetails> = (routeDetails: any) => {
  return {
    type: Constants.UPDATE_ROUTE_DETAILS as any,
    routeDetails
  };
};

const loadPageComponents = (routeDetails: EtoolsRouteDetails) => async (_dispatch: any, _getState: any) => {
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
    return;
  }

  const page = routeDetails.routeName;
  const subpage = routeDetails.subRouteName;
  const subSubPage = routeDetails.subSubRouteName;

  try {
    await import(`../../pages/${page}.ts`);

    if (subpage) {
      await import(`../../pages/${page}/${subpage}.ts`);

      if (subSubPage) {
        await import(`../../pages/${page}/${subpage}/${subSubPage}.ts`);
      }
    }

    if (subSubPage === 'pd') {
      const pdPage = routeDetails.params?.pdID ? 'router' : 'index';
      await import(`../../pages/${page}/${subpage}/${subSubPage}/pd-${pdPage}.ts`);

      if (pdPage === 'router') {
        const pdSubPage = routeDetails.params?.pdRoute || 'details';
        await import(`../../pages/${page}/${subpage}/${subSubPage}/pd-${pdSubPage}.ts`);
      }
    }
  } catch {
    console.log(
      `No file imports configuration found: ${page}-${subpage}-${subSubPage}-pd:${pdPage}-pdSub:${pdSubPage}!`
    );
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
  }
};

/** Update Redux route details and import lazy loaded pages */
export const handleUrlChange = (path: string) => (dispatch: any, getState: any) => {
  // if app route is accessed, redirect to default route (if not already on it)
  // @ts-ignore
  if (
    path === Environment.basePath &&
    Environment.basePath !== EtoolsRouter.prepareLocationPath(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT))
  ) {
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
    return;
  }

  // some routes need redirect to subRoute list
  const redirectPath: string | undefined = EtoolsRouter.getRedirectToListPath(path);
  if (redirectPath) {
    EtoolsRouter.updateAppLocation(redirectPath);
    return;
  }

  // handle can Access
  const currentRouteDetails = getState().app.routeDetails;
  const routeDetails = EtoolsRouter.getRouteDetails(path);
  dispatch(loadPageComponents(routeDetails!));
  if (!isJsonStrMatch(routeDetails, currentRouteDetails)) {
    dispatch(updateStoreRouteDetails(routeDetails));
  }
};
