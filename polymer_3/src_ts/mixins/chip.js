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
/**
 * @polymer
 * @mixinFunction
 */
function ChipMixin(baseClass) {
    var ChipClass = /** @class */ (function (_super) {
        __extends(ChipClass, _super);
        function ChipClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._adding = false;
            return _this;
        }
        ChipClass.prototype._open = function (e) {
            e.preventDefault();
            this.set('_adding', true);
        };
        ChipClass.prototype._close = function () {
            this.set('_adding', false);
        };
        __decorate([
            decorators_1.property({ type: Boolean, observer: '_setDefaults' })
        ], ChipClass.prototype, "_adding", void 0);
        return ChipClass;
    }(baseClass));
    return ChipClass;
}
exports.default = ChipMixin;
