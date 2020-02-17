import {Constructor} from '../typings/globals.types';
import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {userLogout} from '../redux/actions'

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
          case 403: // FIXME: 401?
            // (dci)
            this.reduxStore.dispatch(userLogout())
            //.then(function() {
            location.pathname = '/landing';
            //});
            break;

          default:
            break;
        }
      } catch (err) {}
    }

  }
  return ErrorHandlerClass;
}

export default ErrorHandlerMixin;
