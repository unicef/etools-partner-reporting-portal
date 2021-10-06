var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import '@google-web-components/google-chart';
import './analysis-widget';
import '../../list-placeholder';
import UtilsMixin from '../../../mixins/utils-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import AnalysisChartMixin from '../../../mixins/analysis-chart-mixin';
import Constants from '../../../constants';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin AnalysisChartMixin
 */
class CurrentProgressByLocation extends UtilsMixin(LocalizeMixin(AnalysisChartMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.widgetTitle = 'Current progress by Location';
        this.cols = [
            {
                label: 'Location',
                type: 'string'
            },
            {
                label: 'Progress',
                type: 'number'
            },
            {
                type: 'string',
                role: 'tooltip',
                p: {
                    html: true
                }
            }
        ];
    }
    static get template() {
        return html `
    <style>
      :host {
        display: block;
      }

      google-chart {
        width: 100%;
        height: 100%;
      }
    </style>

    <analysis-widget widget-title="[[_localizeLowerCased(widgetTitle, localize)]]">
      <div hidden$="[[!rows.length]]">
        <google-chart
            type="bar"
            options="[[options]]"
            cols="[[cols]]"
            rows="[[rows]]">
        </google-chart>
      </div>

      <list-placeholder
          data="[[rows]]"
          message="No data for [[_localizeLowerCased(widgetTitle, localize)]] yet.">
      </list-placeholder>
    </analysis-widget>
  `;
    }
    _computeOptions(rows) {
        return Object.assign({}, this._baseOptions, {
            height: rows.length * 45 + 30,
            colors: rows.map(function () {
                return '#88c245';
            }),
            chartArea: {
                top: 0,
                left: '30%',
                width: '50%'
            }
        });
    }
    _computeRows(data) {
        const self = this;
        return Object.keys(data || {}).map(function (key) {
            return [
                key,
                data[key].progress,
                self._buildTooltipContent(key, data[key]),
            ];
        }, this);
    }
    _buildTooltipContent(title, data) {
        return [
            '<div class="tooltip-content">',
            '<div>' + title + '</div>',
            '<div class="number-of-partners">',
            numeral(data.progress).format(Constants.FORMAT_NUMBER_DEFAULT),
            '</div>',
            '<div>Contributing Partners:</div>',
            '<div>' + this._commaSeparated(data.partners) + '</div>',
            '</div>'
        ].join('\n');
    }
}
__decorate([
    property({ type: Object })
], CurrentProgressByLocation.prototype, "data", void 0);
__decorate([
    property({ type: String })
], CurrentProgressByLocation.prototype, "widgetTitle", void 0);
__decorate([
    property({ type: Array })
], CurrentProgressByLocation.prototype, "cols", void 0);
__decorate([
    property({ type: Array, computed: '_computeRows(data)' })
], CurrentProgressByLocation.prototype, "rows", void 0);
window.customElements.define('current-progress-by-location', CurrentProgressByLocation);
