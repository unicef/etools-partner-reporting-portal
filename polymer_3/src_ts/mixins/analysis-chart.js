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
var constants_1 = require("../constants");
require("numeral/min/numeral.min.js");
/**
 * @polymer
 * @mixinFunction
 */
function AnalysisChartMixin(baseClass) {
    var AnalysisChartClass = /** @class */ (function (_super) {
        __extends(AnalysisChartClass, _super);
        function AnalysisChartClass() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tooltipStyles = [
                '.google-visualization-tooltip {',
                'padding: 10px;',
                'position: absolute;',
                'border-radius: 3px;',
                'font: 11px/1.5 Roboto, Noto, sans-serif;',
                'color: rgba(255, 255, 255, .9);',
                'background: #424242;',
                'box-shadow: 0 3px 14px rgba(0, 0, 0, .4);',
                'opacity: .7;',
                'z-index: 1000',
                '}',
                '.tooltip-content {',
                'max-width: 200px;',
                '}',
                '.number-of-partners {',
                'margin: .5em 0;',
                'font-size: 2.5em;',
                'line-height: 1;',
                'color: #fff;',
                '}',
                '.number-of-partners:last-child {',
                'margin-bottom: 0;',
                '}',
                '.progress {',
                'color: #fff;',
                '}',
                '.number-of-partners + .progress {',
                'margin-top: -.75em;',
                '}',
                '.project-value {',
                'font-size: 2.5em;',
                'line-height: 1.75;',
                'color: #fff;',
                '}',
                '.partner-value {',
                'font-size: 1.15em;',
                'line-height: 1;',
                'color: #fff;',
                '}',
            ].join('\n');
            _this._baseOptions = {
                bar: {
                    groupWidth: 20,
                },
                chartArea: {
                    top: 0,
                },
                legend: 'none',
                tooltip: {
                    isHtml: true,
                    ignoreBounds: true,
                },
            };
            _this.options = {};
            return _this;
        }
        AnalysisChartClass.prototype._buildTooltipContent = function (title, data) {
            return [
                '<div class="tooltip-content">',
                '<div>' + title + '</div>',
                '<div class="number-of-partners">',
                numeral(data.length).format(constants_1.default.FORMAT_NUMBER_DEFAULT),
                '</div>',
                '<div>' + this._joinWithComma(data) + '</div>',
                '</div>',
            ].join('\n');
        };
        AnalysisChartClass.prototype._joinWithComma = function (items) {
            if (!items) {
                return '';
            }
            return items.join(', ');
        };
        AnalysisChartClass.prototype._computeRows = function (data) {
            return Object.keys(data).map(function (key) {
                return [
                    key,
                    data[key].length,
                    this._buildTooltipContent(key, data[key]),
                ];
            }, this);
        };
        AnalysisChartClass.prototype._fromJSON = function (obj) {
            return obj ? obj.v / obj.d : 0;
        };
        AnalysisChartClass.prototype.connectedCallback = function () {
            _super.prototype.connectedCallback.call(this);
            this.addChartStyle();
        };
        AnalysisChartClass.prototype.addChartStyle = function () {
            var style = document.createElement('style');
            style.innerHTML = this.tooltipStyles;
            var googleChart = this.shadowRoot.querySelector('google-chart');
            if (googleChart) {
                googleChart.shadowRoot.appendChild(style);
            }
        };
        __decorate([
            decorators_1.property({ type: Object })
        ], AnalysisChartClass.prototype, "_baseOptions", void 0);
        __decorate([
            decorators_1.property({ type: Object, computed: '_computeOptions(rows)' })
        ], AnalysisChartClass.prototype, "options", void 0);
        return AnalysisChartClass;
    }(baseClass));
    return AnalysisChartClass;
}
exports.default = AnalysisChartMixin;
