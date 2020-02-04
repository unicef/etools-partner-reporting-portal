"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/** (dci) TODO: need to import redux
 * @polymer
 * @mixinFunction
 */
function ErrorHandlerMixin(baseClass) {
    var ErrorHandlerClass = /** @class */ (function (_super) {
        __extends(ErrorHandlerClass, _super);
        function ErrorHandlerClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ErrorHandlerClass.prototype._handleError = function (e) {
            var xhr;
            try {
                xhr = e.detail.request.xhr;
                if (!xhr) {
                    return;
                }
                switch (xhr.status) {
                    case 403: // FIXME: 401?
                        App.Store.dispatch(App.Actions.userLogout())
                            .then(function () {
                            location.pathname = '/landing';
                        });
                        break;
                    default:
                        break;
                }
            }
            catch (err) { }
        };
        return ErrorHandlerClass;
    }(baseClass));
    return ErrorHandlerClass;
}
exports.default = ErrorHandlerMixin;
