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
function DisaggregationFieldMixin(baseClass) {
    var DisaggregationFieldClass = /** @class */ (function (_super) {
        __extends(DisaggregationFieldClass, _super);
        function DisaggregationFieldClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        DisaggregationFieldClass.prototype._toNumericValues = function (obj) {
            return Object.keys(obj).reduce(function (prev, curr) {
                prev[curr] = Number(obj[curr]);
                return prev;
            }, {});
        };
        return DisaggregationFieldClass;
    }(baseClass));
    return DisaggregationFieldClass;
}
exports.default = DisaggregationFieldMixin;
