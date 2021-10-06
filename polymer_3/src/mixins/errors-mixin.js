import { userLogout } from '../redux/actions';
/**
 * @polymer
 * @mixinFunction
 */
function ErrorHandlerMixin(baseClass) {
    class ErrorHandlerClass extends baseClass {
        _handleError(e) {
            let xhr;
            try {
                xhr = e.detail.request.xhr;
                if (!xhr) {
                    return;
                }
                switch (xhr.status) {
                    case 403: // FIXME: 401?
                        // (dci)
                        // @ts-ignore
                        this.reduxStore.dispatch(userLogout())
                            // @ts-ignore
                            .then(() => {
                            location.pathname = '/landing';
                        });
                        break;
                    default:
                        break;
                }
            }
            catch (err) { }
        }
    }
    return ErrorHandlerClass;
}
export default ErrorHandlerMixin;
