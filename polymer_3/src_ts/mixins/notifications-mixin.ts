import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';
import {fireEvent} from '../utils/fire-custom-event';


/**
 * @polymer
 * @mixinFunction
 */
function NotificationsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class NotificationsClass extends baseClass {

    public _notify(type, options) {
      fireEvent(this,'notify', Object.assign({
        type: type,
      }, options));
    }

    public _notifyChangesSaved(options) {
      this._notify('changes-saved', options);
    }

    public _notifyServerError(options) {
      this._notify('server-error', options);
    }

    public _notifyFileUploaded(options) {
      this._notify('file-uploaded', options);
    }

    public _notifyFileDeleted(options) {
      this._notify('file-deleted', options);
    }

    public _notifyMessageSent(options) {
      this._notify('message-sent', options);
    }

    public _notifyErrorMessage(options) {
      this._notify('error-message', options);
    }

  }
}

export default NotificationsMixin;
