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
var settings_1 = require("../settings");
/**
 * @polymer
 * @mixinFunction
 */
function ResponsiveMixin(baseClass) {
    var ResponsiveClass = /** @class */ (function (_super) {
        __extends(ResponsiveClass, _super);
        function ResponsiveClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.desktopLayoutQuery = settings_1.default.layout.threshold;
            _this.isDesktop = {
                type: Boolean,
            };
            return _this;
        }
        Object.defineProperty(ResponsiveClass, "observers", {
            get: function () {
                return [
                    '_isDesktopChanged(isDesktop)'
                ];
            },
            enumerable: true,
            configurable: true
        });
        ResponsiveClass.prototype._isDesktopChanged = function () {
            this.updateStyles();
        };
        __decorate([
            decorators_1.property({ type: String, readOnly: true })
        ], ResponsiveClass.prototype, "desktopLayoutQuery", void 0);
        __decorate([
            decorators_1.property({ type: Object })
        ], ResponsiveClass.prototype, "isDesktop", void 0);
        return ResponsiveClass;
    }(baseClass));
    return ResponsiveClass;
}
exports.default = ResponsiveMixin;
