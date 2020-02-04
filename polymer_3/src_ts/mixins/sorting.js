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
var debounce_1 = require("@polymer/polymer/lib/utils/debounce");
var async_1 = require("@polymer/polymer/lib/utils/async");
/**
* @polymer
* @mixinFunction
*/
function SortingMixin(baseClass) {
    var SortingClass = /** @class */ (function (_super) {
        __extends(SortingClass, _super);
        function SortingClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SortingClass.prototype._sortOrderChanged = function (e) {
            var _this = this;
            var data = e.detail;
            this._sortOrderDebouncer = debounce_1.Debouncer.debounce(this._sortOrderDebouncer, async_1.timeOut.after(100), function () {
                var newParams = Object.assign({}, _this.queryParams, {
                    sort: data.field + '.' + data.direction,
                });
                e.stopPropagation();
                _this.set('queryParams', newParams);
            });
        };
        SortingClass.prototype.connectedCallback = function () {
            _super.prototype.connectedCallback.call(this);
            this._sortOrderChanged = this._sortOrderChanged.bind(this);
            this.addEventListener('sort-changed', this._sortOrderChanged);
        };
        SortingClass.prototype.disconnectedCallback = function () {
            _super.prototype.disconnectedCallback.call(this);
            this.removeEventListener('sort-changed', this._sortOrderChanged);
            if (this._sortOrderDebouncer && this._sortOrderDebouncer.isActive()) {
                this._sortOrderDebouncer.cancel();
            }
        };
        return SortingClass;
    }(baseClass));
    return SortingClass;
}
exports.default = SortingMixin;
