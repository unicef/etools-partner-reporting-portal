import { fireEvent } from '../utils/fire-custom-event';
/**
 * @polymer
 * @mixinFunction
 */
function NotificationsMixin(baseClass) {
    class NotificationsClass extends baseClass {
        _notify(type, options) {
            fireEvent(this, 'notify', Object.assign({
                type: type
            }, options));
        }
        _notifyChangesSaved(options) {
            this._notify('changes-saved', options);
        }
        _notifyServerError(options) {
            this._notify('server-error', options);
        }
        _notifyFileUploaded(options) {
            this._notify('file-uploaded', options);
        }
        _notifyFileDeleted(options) {
            this._notify('file-deleted', options);
        }
        _notifyMessageSent(options) {
            this._notify('message-sent', options);
        }
        _notifyErrorMessage(options) {
            this._notify('error-message', options);
        }
    }
    return NotificationsClass;
}
export default NotificationsMixin;
