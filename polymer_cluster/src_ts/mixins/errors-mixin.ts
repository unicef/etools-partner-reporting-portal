import {Constructor} from '../typings/globals.types';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @polymer
 * @mixinFunction
 */
function ErrorHandlerMixin<T extends Constructor<ReduxConnectedElement>>(baseClass: T) {
  class ErrorHandlerClass extends baseClass {
    _handleError(e: CustomEvent) {
      let xhr;
      try {
        xhr = e.detail.request.xhr;
        if (!xhr) {
          return;
        }
        switch (xhr.status) {
          case 401:
            fireEvent(this, 'sign-out');
            break;
          default:
            break;
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
  return ErrorHandlerClass;
}

export default ErrorHandlerMixin;
