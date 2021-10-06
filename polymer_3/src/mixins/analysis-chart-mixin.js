var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { property } from '@polymer/decorators';
import Constants from '../constants';
/**
 * @polymer
 * @mixinFunction
 */
function AnalysisChartMixin(baseClass) {
    class AnalysisChartClass extends baseClass {
        constructor() {
            super(...arguments);
            this.tooltipStyles = [
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
                '}'
            ].join('\n');
            this._baseOptions = {
                bar: {
                    groupWidth: 20
                },
                chartArea: {
                    top: 0
                },
                legend: 'none',
                tooltip: {
                    isHtml: true,
                    ignoreBounds: true
                }
            };
            this.options = {};
        }
        _buildTooltipContent(title, data) {
            return [
                '<div class="tooltip-content">',
                '<div>' + title + '</div>',
                '<div class="number-of-partners">',
                numeral(data.length).format(Constants.FORMAT_NUMBER_DEFAULT),
                '</div>',
                '<div>' + this._joinWithComma(data) + '</div>',
                '</div>'
            ].join('\n');
        }
        _joinWithComma(items) {
            if (!items) {
                return '';
            }
            return items.join(', ');
        }
        _computeRows(data) {
            return Object.keys(data).map((key) => {
                return [
                    key,
                    data[key].length,
                    this._buildTooltipContent(key, data[key])
                ];
            }, this);
        }
        _fromJSON(obj) {
            return obj ? obj.v / obj.d : 0;
        }
        connectedCallback() {
            super.connectedCallback();
            this.addChartStyle();
        }
        addChartStyle() {
            const style = document.createElement('style');
            style.innerHTML = this.tooltipStyles;
            const googleChart = this.shadowRoot.querySelector('google-chart');
            if (googleChart) {
                googleChart.shadowRoot.appendChild(style);
            }
        }
    }
    __decorate([
        property({ type: Object })
    ], AnalysisChartClass.prototype, "_baseOptions", void 0);
    __decorate([
        property({ type: Object, computed: '_computeOptions(rows)' })
    ], AnalysisChartClass.prototype, "options", void 0);
    return AnalysisChartClass;
}
export default AnalysisChartMixin;
