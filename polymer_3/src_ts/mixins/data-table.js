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
/**
 * @polymer
 * @mixinFunction
 */
function DataTableMixin(baseClass) {
    var DataTableClass = /** @class */ (function (_super) {
        __extends(DataTableClass, _super);
        function DataTableClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DataTableClass.prototype._pageSizeChanged = function (e) {
            var change = {
                page_size: e.detail.value,
            };
            if (this._pageNumberInitialized) {
                change.page = 1;
            }
            this.set('queryParams', Object.assign({}, this.queryParams, change));
        };
        DataTableClass.prototype._pageNumberChanged = function (e) {
            var _this = this;
            this.set('queryParams', Object.assign({}, this.queryParams, {
                page: e.detail.value,
            }));
            setTimeout(function () {
                _this.set('_pageNumberInitialized', true);
            });
        };
        return DataTableClass;
    }(baseClass));
    return DataTableClass;
}
exports.default = DataTableMixin;
