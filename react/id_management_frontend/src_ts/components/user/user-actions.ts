import {AnyObject} from '../../types/globals';
import {updateUserData} from '../../redux/actions/user';
import {getEndpoint} from '../../endpoints/endpoints';
import {store} from '../../redux/store';
import {etoolsEndpoints} from '../../endpoints/endpoints-list';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

export function getCurrentUser() {
  return sendRequest({
    endpoint: {url: getEndpoint(etoolsEndpoints.userProfile).url}
  })
    .then((response: AnyObject) => {
      store.dispatch(updateUserData(response));
      return response;
    })
    .catch((error: AnyObject) => {
      console.error('[EtoolsUser]: getUserData req error...', error);
      throw error;
    });
}

export function updateCurrentUser(profile: AnyObject) {
  return sendRequest({
    method: 'PATCH',
    endpoint: {url: getEndpoint(etoolsEndpoints.userProfile).url},
    body: profile
  })
    .then((response: AnyObject) => {
      store.dispatch(updateUserData(response));
    })
    .catch((error: AnyObject) => {
      console.error('[EtoolsUser]: updateUserData req error ', error);
      throw error;
    });
}

export function changeCurrentUserCountry(countryId: number) {
  return sendRequest({
    method: 'POST',
    endpoint: {url: getEndpoint(etoolsEndpoints.changeCountry).url},
    body: {country: countryId}
  }).catch((error: AnyObject) => {
    console.error('[EtoolsUser]: changeCountry req error ', error);
    throw error;
  });
}
