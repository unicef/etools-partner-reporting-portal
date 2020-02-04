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
function FilterDependenciesMixin(baseClass) {
    var FilterDependenciesClass = /** @class */ (function (_super) {
        __extends(FilterDependenciesClass, _super);
        function FilterDependenciesClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.dependencies = '';
            _this.defaultParams = {};
            return _this;
        }
        Object.defineProperty(FilterDependenciesClass, "observers", {
            get: function () {
                return [
                    '_computeParams(dependencies, queryParams)',
                ];
            },
            enumerable: true,
            configurable: true
        });
        FilterDependenciesClass.prototype._computeParams = function (dependencies, queryParams) {
            var newParams = dependencies
                .split(',')
                .filter(Boolean)
                .reduce(function (acc, key) {
                if (typeof queryParams[key] !== 'undefined') {
                    acc[key] = queryParams[key];
                }
                return acc;
            }, Object.assign({}, this.defaultParams));
            var serialized = this._serializeParams(newParams);
            if (serialized !== this.get('lastParams')) {
                this.set('lastParams', serialized);
                this.set('params', newParams);
            }
        };
        FilterDependenciesClass.prototype._serializeParams = function (params) {
            return JSON.stringify(params);
        };
        __decorate([
            decorators_1.property({ type: String })
        ], FilterDependenciesClass.prototype, "lastParams", void 0);
        __decorate([
            decorators_1.property({ type: Object })
        ], FilterDependenciesClass.prototype, "params", void 0);
        __decorate([
            decorators_1.property({ type: String })
        ], FilterDependenciesClass.prototype, "dependencies", void 0);
        __decorate([
            decorators_1.property({ type: Object })
        ], FilterDependenciesClass.prototype, "defaultParams", void 0);
        return FilterDependenciesClass;
    }(baseClass));
    return FilterDependenciesClass;
}
exports.default = FilterDependenciesMixin;
