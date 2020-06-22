import {Constructor} from '../typings/globals.types';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
// import {fireEvent} from '../utils/fire-custom-event';

/**
 * @polymer
 * @mixinFunction
 */
function ErrorHandlerMixin<T extends Constructor<ReduxConnectedElement>>(baseClass: T) {
  class ErrorHandlerClass extends baseClass {
    _handleError() {
      // e: CustomEvent
      // let xhr;
      // try {
      //   xhr = e.detail.request.xhr;
      //   if (!xhr) {
      //     return;
      //   }
      //   old code:
      //   switch (xhr.status) {
      //     case 403: // FIXME: 401?
      //       App.Store.dispatch(App.Actions.userLogout())
      //           .then(function () {
      //             location.pathname = '/landing';
      //           });
      //       break;
      //   switch (xhr.status) {
      //     case 401: // FIXME: 401?
      //       fireEvent(this, 'sign-out');
      //       break;
      //     default:
      //       break;
      //   }
      // } catch (err) {
      //   console.log(err);
      // }
    }
  }
  return ErrorHandlerClass;
}

export default ErrorHandlerMixin;
