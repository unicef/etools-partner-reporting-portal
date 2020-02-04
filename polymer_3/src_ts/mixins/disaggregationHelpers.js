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
function DisaggregationHelpersMixin(baseClass) {
    var DisaggregationHelpersClass = /** @class */ (function (_super) {
        __extends(DisaggregationHelpersClass, _super);
        function DisaggregationHelpersClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.matchers = {
                '(?,?)': function () {
                    return /^\((\d*),\s?(\d*)\)$/;
                },
                '(?,?,?)': function () {
                    return /^\((\d*),\s?(\d*),\s?(\d*)\)$/;
                },
                '(?,Y)': function (y) {
                    return new RegExp('^\\((\\d+),\\s?(' + y + ')\\)$');
                },
                '(X,?)': function (x) {
                    return new RegExp('^\\((' + x + '),\\s?(\\d+)\\)$');
                },
                '(X,Y,?)': function (x, y) {
                    return new RegExp('^\\((' + x + '),\\s?(' + y + '),\\s?(\\d+)\\)$');
                },
                '(X,?,Z)': function (x, z) {
                    return new RegExp('^\\((' + x + '),\\s?(\\d+),\\s?(' + z + ')\\)$');
                },
                '(?,Y,Z)': function (y, z) {
                    return new RegExp('^\\((\\d+),\\s?(' + y + '),\\s?(' + z + ')\\)$');
                },
                '(?,?,Z)': function (z) {
                    return new RegExp('^\\((\\d+),\\s?(\\d+),\\s?(' + z + ')\\)$');
                },
            };
            return _this;
        }
        DisaggregationHelpersClass.prototype.identity = function (val) {
            return val;
        };
        DisaggregationHelpersClass.prototype.divideBy = function (d) {
            return function (v) {
                return v / d;
            };
        };
        DisaggregationHelpersClass.prototype.sumDisaggValues = function (fields, transform) {
            var result;
            if (typeof transform === 'undefined') {
                transform = this.identity;
            }
            result = fields
                .filter(function (field) {
                return ['v', 'd'].every(function (key) {
                    return !isNaN(field[key]);
                });
            })
                .reduce(function (acc, curr) {
                ['v', 'd'].forEach(function (key) {
                    acc[key] = (acc[key] || 0) + transform(curr[key]);
                });
                return acc;
            }, {});
            var c = result.v / result.d;
            if (c === c) {
                result.c = c;
            }
            else { // Defaulting c value to be 0 if both v and d values are zero
                result.c = 0;
            }
            return result;
        };
        DisaggregationHelpersClass.prototype.getCoords = function (key) {
            var match = [
                this.matchers['(?,?)'](),
                this.matchers['(?,?,?)'](),
            ]
                .map(function (re) {
                return re.exec(key);
            })
                .filter(Boolean)[0];
            if (match) {
                return match.slice(1, 4);
            }
            return [];
        };
        DisaggregationHelpersClass.prototype.extractFields = function (data, re) {
            return Object.keys(data)
                .filter(function (k) {
                return re.exec(k);
            })
                .map(function (k) {
                return data[k];
            });
        };
        DisaggregationHelpersClass.prototype.formatKey = function () {
            var chunks = [].slice.call(arguments);
            var formatted = '(' + chunks.join(', ') + ')';
            // Normalizes whitespace inconsistencies across keys
            return formatted.replace(/(,)(\s)(\))$/, '$1$3');
        };
        DisaggregationHelpersClass.prototype._calculateLevel1 = function (key, data) {
            var coords = this.getCoords(key);
            var y = coords[1];
            var yRe = this.matchers['(?,Y)'](y);
            var totals = {};
            var yKey = this.formatKey(y);
            var yFields = this.extractFields(data, yRe);
            totals[yKey] = this.sumDisaggValues(yFields);
            return totals;
        };
        DisaggregationHelpersClass.prototype._calculateLevel2 = function (key, data) {
            var coords = this.getCoords(key);
            var x = coords[0];
            var y = coords[1];
            var xRe = this.matchers['(X,?)'](x);
            var yRe = this.matchers['(?,Y)'](y);
            var tRe = this.matchers['(?,Y)']('');
            var tmpTotals1 = {};
            var tmpTotals2 = {};
            var xKey = this.formatKey(x, '');
            var yKey = this.formatKey(y, '');
            var xFields = this.extractFields(data, xRe);
            var yFields = this.extractFields(data, yRe);
            tmpTotals1[xKey] = this.sumDisaggValues(xFields);
            tmpTotals1[yKey] = this.sumDisaggValues(yFields);
            data = Object.assign({}, data, tmpTotals1);
            var tKey = this.formatKey('');
            var tFields = this.extractFields(data, tRe);
            tmpTotals2[tKey] = this.sumDisaggValues(tFields, this.divideBy(2));
            return Object.assign({}, tmpTotals1, tmpTotals2);
        };
        DisaggregationHelpersClass.prototype._calculateLevel3 = function (key, data) {
            var coords = this.getCoords(key);
            var x = coords[0];
            var y = coords[1];
            var z = coords[2];
            var xyRe = this.matchers['(X,Y,?)'](x, y);
            var xzRe = this.matchers['(X,?,Z)'](x, z);
            var yzRe = this.matchers['(?,Y,Z)'](y, z);
            var xRe = this.matchers['(X,?)'](x);
            var yRe = this.matchers['(X,?)'](y);
            var zRe = this.matchers['(?,?,Z)'](z);
            var tRe = this.matchers['(?,Y)']('');
            var tmpTotals1 = {};
            var tmpTotals2 = {};
            var tmpTotals3 = {};
            var xyKey = this.formatKey(x, y);
            var xzKey = this.formatKey(x, z);
            var yzKey = this.formatKey(y, z);
            var xyFields = this.extractFields(data, xyRe);
            var xzFields = this.extractFields(data, xzRe);
            var yzFields = this.extractFields(data, yzRe);
            tmpTotals1[xyKey] = this.sumDisaggValues(xyFields);
            tmpTotals1[xzKey] = this.sumDisaggValues(xzFields);
            tmpTotals1[yzKey] = this.sumDisaggValues(yzFields);
            data = Object.assign({}, data, tmpTotals1);
            var xKey = this.formatKey(x, '');
            var yKey = this.formatKey(y, '');
            var zKey = this.formatKey(z, '');
            var xFields = this.extractFields(data, xRe);
            var yFields = this.extractFields(data, yRe);
            var zFields = this.extractFields(data, zRe);
            tmpTotals2[xKey] = this.sumDisaggValues(xFields, this.divideBy(2));
            tmpTotals2[yKey] = this.sumDisaggValues(yFields);
            tmpTotals2[zKey] = this.sumDisaggValues(zFields);
            data = Object.assign({}, data, tmpTotals2);
            var tKey = this.formatKey('');
            var tFields = this.extractFields(data, tRe);
            tmpTotals3[tKey] = this.sumDisaggValues(tFields, this.divideBy(3));
            return Object.assign({}, tmpTotals1, tmpTotals2, tmpTotals3);
        };
        return DisaggregationHelpersClass;
    }(baseClass));
    return DisaggregationHelpersClass;
}
exports.default = DisaggregationHelpersMixin;
