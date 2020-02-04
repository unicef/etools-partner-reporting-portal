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
var fire_custom_event_1 = require("../utils/fire-custom-event");
/**
 * @polymer
 * @mixinFunction
 */
function FilterMixin(baseClass) {
    var FilterClass = /** @class */ (function (_super) {
        __extends(FilterClass, _super);
        function FilterClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        FilterClass.prototype._computeLastValue = function (value) {
            return value;
        };
        FilterClass.prototype._filterReady = function () {
            var _this = this;
            setTimeout(function () {
                fire_custom_event_1.fireEvent(_this, 'filter-ready', _this.name);
            });
        };
        FilterClass.prototype.connectedCallback = function () {
            _super.prototype.connectedCallback.call(this);
            fire_custom_event_1.fireEvent(this, 'register-filter', this.name);
        };
        FilterClass.prototype.disconnectedCallback = function () {
            _super.prototype.disconnectedCallback.call(this);
            fire_custom_event_1.fireEvent(this, 'deregister-filter', this.name);
        };
        FilterClass._debounceDelay = 400;
        __decorate([
            decorators_1.property({ type: String })
        ], FilterClass.prototype, "label", void 0);
        __decorate([
            decorators_1.property({ type: String })
        ], FilterClass.prototype, "name", void 0);
        __decorate([
            decorators_1.property({ type: String, computed: '_computeLastValue(value)', })
        ], FilterClass.prototype, "lastValue", void 0);
        return FilterClass;
    }(baseClass));
    return FilterClass;
}
exports.default = FilterMixin;
