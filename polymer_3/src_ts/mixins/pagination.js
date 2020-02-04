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
function PaginationMixin(baseClass) {
    var PaginationClass = /** @class */ (function (_super) {
        __extends(PaginationClass, _super);
        function PaginationClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Object.defineProperty(PaginationClass, "observers", {
            get: function () {
                return [
                    '_updateQueryParams(pageSize, pageNumber)',
                ];
            },
            enumerable: true,
            configurable: true
        });
        PaginationClass.prototype._computePageSize = function (queryParams) {
            return Number(queryParams.page_size || 10);
        };
        PaginationClass.prototype._computePageNumber = function (queryParams) {
            return Number(queryParams.page || 1);
        };
        PaginationClass.prototype._updateQueryParams = function (pageSize, pageNumber) {
            var _this = this;
            var newParams = Object.assign({}, this.queryParams, {
                page_size: pageSize,
                page: pageNumber,
            });
            setTimeout(function () {
                _this.set('queryParams', newParams);
            });
        };
        PaginationClass.prototype._detailsChange = function (event) {
            var element = event.composedPath()[0];
            var isOpen = element && element.detailsOpened;
            if (isOpen) {
                return this.push('openedDetails', element);
            }
            var index = this.openedDetails.indexOf(element);
            if (index !== -1) {
                return this.splice('openedDetails', index, 1);
            }
        };
        PaginationClass.prototype._tableContentChanged = function () {
            var _this = this;
            this._tableContentDebouncer = debounce_1.Debouncer.debounce(this._tableContentDebouncer, async_1.timeOut.after(100), function () {
                var tempList = _this.openedDetails.slice();
                tempList.forEach(function (detail) { return detail.detailsOpened = false; });
            });
        };
        PaginationClass.prototype.detached = function () {
            if (this._tableContentDebouncer && this._tableContentDebouncer.isActive()) {
                this._tableContentDebouncer.cancel();
            }
        };
        __decorate([
            decorators_1.property({ type: Object })
        ], PaginationClass.prototype, "queryParams", void 0);
        __decorate([
            decorators_1.property({ type: Number, computed: '_computePageSize(queryParams)' })
        ], PaginationClass.prototype, "pageSize", void 0);
        __decorate([
            decorators_1.property({ type: Number, computed: '_computePageNumber(queryParams)' })
        ], PaginationClass.prototype, "pageNumber", void 0);
        return PaginationClass;
    }(baseClass));
    return PaginationClass;
}
exports.default = PaginationMixin;
