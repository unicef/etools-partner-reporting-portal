import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';


/** (dci) TODO: need to import redux
 * @polymer
 * @mixinFunction
 */
function ErrorHandlerMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
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
            App.Store.dispatch(App.Actions.userLogout())
              .then(function() {
                location.pathname = '/landing';
              });
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
