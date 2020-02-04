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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var decorators_1 = require("@polymer/decorators");
var debounce_1 = require("@polymer/polymer/lib/utils/debounce");
var async_1 = require("@polymer/polymer/lib/utils/async");
/**
 * @polymer
 * @mixinFunction
 */
function ModalMixin(baseClass) {
    var ModalClass = /** @class */ (function (_super) {
        __extends(ModalClass, _super);
        function ModalClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ModalClass.prototype.close = function () {
            this.set('opened', false);
        };
        ModalClass.prototype.open = function () {
            this.set('opened', true);
        };
        ModalClass.prototype.adjustPosition = function (e) {
            var _this = this;
            e.stopPropagation();
            this._adjustPositionDebouncer = debounce_1.Debouncer.debounce(this._adjustPositionDebouncer, async_1.timeOut.after(100), function () {
                _this.$.dialog.refit();
            });
        };
        ModalClass.prototype.detached = function () {
            if (this._adjustPositionDebouncer && this._adjustPositionDebouncer.isActive()) {
                this._adjustPositionDebouncer.cancel();
            }
        };
        __decorate([
            decorators_1.property({ type: Boolean, notify: true })
        ], ModalClass.prototype, "opened", void 0);
        return ModalClass;
    }(baseClass));
    return ModalClass;
}
exports.default = ModalMixin;
