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
import '../../numeral-js';
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
class CurrentProgressByPartner extends UtilsMixin(LocalizeMixin(AnalysisChartMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.widgetTitle = 'Current progress by Partner';
        this.cols = [
            {
                label: 'Partner',
                type: 'string'
            },
            {
                label: 'Target',
                type: 'number'
            },
            {
                type: 'string',
                role: 'tooltip',
                p: {
                    html: true
                }
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
            height: rows.length * 45 + 40,
            colors: ['#e0e0e0', '#88c245'],
            chartArea: {
                top: 0,
                bottom: 55,
                left: '30%',
                width: '50%',
            },
            bars: 'horizontal',
            legend: {
                position: 'bottom',
            },
        });
    }
    _computeRows(data) {
        return Object.keys(data || {}).map((key) => {
            const target = data[key].target;
            const progress = data[key].progress;
            return [
                key,
                this._fromJSON(target),
                this._buildTooltipContent(key, data[key]),
                progress,
                this._buildTooltipContent(key, data[key])
            ];
        }, this);
    }
    _buildTooltipContent(title, data) {
        const target = this._fromJSON(data.target);
        const inNeed = this._fromJSON(data.in_need);
        const progressAgainstTarget = data.progress / target;
        const progressAgainstInNeed = data.progress / inNeed;
        return [
            '<div class="tooltip-content">',
            '<div>' + title + '</div>',
            '<div class="number-of-partners">',
            numeral(data.progress).format(Constants.FORMAT_NUMBER_DEFAULT),
            '</div>',
            '<div class="progress">',
            this._toPercentage(progressAgainstTarget) + ' of Target',
            '</div>',
            '<div class="progress">',
            this._toPercentage(progressAgainstInNeed) + ' of In Need',
            '</div>',
            '<br>',
            '<div>Locations:</div>',
            '<div>' + this._commaSeparated(data.locations) + '</div>',
            '</div>'
        ].join('\n');
    }
}
__decorate([
    property({ type: Object })
], CurrentProgressByPartner.prototype, "data", void 0);
__decorate([
    property({ type: String })
], CurrentProgressByPartner.prototype, "widgetTitle", void 0);
__decorate([
    property({ type: Array })
], CurrentProgressByPartner.prototype, "cols", void 0);
__decorate([
    property({ type: Array, computed: '_computeRows(data)' })
], CurrentProgressByPartner.prototype, "rows", void 0);
window.customElements.define('current-progress-by-partner', CurrentProgressByPartner);
