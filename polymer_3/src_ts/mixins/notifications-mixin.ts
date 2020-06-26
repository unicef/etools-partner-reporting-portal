import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../typings/globals.types';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @polymer
 * @mixinFunction
 */
function NotificationsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class NotificationsClass extends baseClass {
    _notify(type: any, options?: any) {
      fireEvent(
        this,
        'notify',
        Object.assign(
          {
            type: type
          },
          options
        )
      );
    }

    _notifyChangesSaved(options?: any) {
      this._notify('changes-saved', options);
    }

    _notifyServerError(options?: any) {
      this._notify('server-error', options);
    }

    _notifyFileUploaded(options?: any) {
      this._notify('file-uploaded', options);
    }

    _notifyFileDeleted(options?: any) {
      this._notify('file-deleted', options);
    }

    _notifyMessageSent(options?: any) {
      this._notify('message-sent', options);
    }

    _notifyErrorMessage(options?: any) {
      this._notify('error-message', options);
    }
  }
  return NotificationsClass;
}

export default NotificationsMixin;
