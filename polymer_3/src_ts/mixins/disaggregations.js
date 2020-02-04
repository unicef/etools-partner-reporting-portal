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
function DisaggregationMixin(baseClass) {
    var DisaggregationClass = /** @class */ (function (_super) {
        __extends(DisaggregationClass, _super);
        function DisaggregationClass() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        //Used to display rows for two and three disaggregations.
        //It will NOT work for one and zero disaggregations.
        DisaggregationClass.prototype._determineRows = function (self, rows, columns) {
            var rowsForDisplay = [];
            rows.forEach(function (x) {
                var formatted = '';
                var rowData = columns.map(function (z) {
                    formatted = self._formatDisaggregationIds([x.id, z.id]);
                    return {
                        key: formatted,
                        data: self.data.disaggregation[formatted],
                    };
                });
                formatted = self._formatDisaggregationIds([x.id]);
                rowsForDisplay.push({
                    title: x.value,
                    data: rowData,
                    id: x.id,
                    total: {
                        key: formatted,
                        data: self.data.disaggregation[formatted],
                    },
                });
            });
            return rowsForDisplay;
        };
        // Accepts a list of disaggregation IDs, sorts them, and
        // structures them in "()" format for lookup.
        DisaggregationClass.prototype._formatDisaggregationIds = function (unsortedIds) {
            // IDs must be in ascending order.
            var ids = unsortedIds.sort(function (a, b) { return a - b; });
            var sortedString = '';
            if (ids.length === 1) {
                sortedString = ids[0] + ',';
            }
            else {
                sortedString = ids.join(', ');
            }
            return '(' + sortedString + ')';
        };
        return DisaggregationClass;
    }(baseClass));
    return DisaggregationClass;
}
exports.default = DisaggregationMixin;
