var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { property } from '@polymer/decorators';
import Constants from '../../../constants';
import '@google-web-components/google-chart';
import '../../numeral-js';
import AnalysisChartMixin from '../../../mixins/analysis-chart-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import UtilsMixin from '../../../mixins/utils-mixin';
import './analysis-widget';
import '../../list-placeholder';
/**
* @polymer
* @customElement
* @mixinFunction
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
* @appliesMixin AnalysisChartMixin
*/
class ProgressOverTime extends LocalizeMixin(UtilsMixin(AnalysisChartMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.widgetTitle = 'Progress over time';
        this.cols = [
            {
                label: 'Time',
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
                label: 'In need',
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
            type="line"
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
    _computeOptions() {
        return Object.assign({}, this._baseOptions, {
            colors: ['#88c245', '#4069c5', '#f19e3a'],
            chartArea: {
                top: 20
            },
            legend: {
                position: 'bottom'
            }
        });
    }
    _computeRowsLocal(data, target, inNeed) {
        const self = this;
        return data.map(function (tick) {
            return [
                tick[0],
                self._fromJSON(tick[1]),
                self._buildProgressTooltipContent(tick, target, inNeed),
                target,
                self._buildDefaultTooltipContent('Target', target),
                inNeed,
                self._buildDefaultTooltipContent('In Need', inNeed)
            ];
        }, this);
    }
    _buildProgressTooltipContent(tick, target, inNeed) {
        const progress = this._fromJSON(tick[1]);
        const progressAgainstTarget = progress / target;
        const progressAgainstInNeed = progress / inNeed;
        return [
            '<div class="tooltip-content">',
            '<div>' + tick[0] + '</div>',
            '<div class="number-of-partners">',
            numeral(progress).format(Constants.FORMAT_NUMBER_DEFAULT),
            '</div>',
            '<div class="progress">',
            this._toPercentage(progressAgainstTarget) + ' of Target',
            '</div>',
            '<div class="progress">',
            this._toPercentage(progressAgainstInNeed) + ' of In Need',
            '</div>',
            '</div>'
        ].join('\n');
    }
    _buildDefaultTooltipContent(title, value) {
        return [
            '<div class="tooltip-content">',
            '<div>' + title + '</div>',
            '<div class="number-of-partners">',
            numeral(value).format(Constants.FORMAT_NUMBER_DEFAULT),
            '</div>',
            '</div>'
        ].join('\n');
    }
}
__decorate([
    property({ type: Object })
], ProgressOverTime.prototype, "target", void 0);
__decorate([
    property({ type: Object })
], ProgressOverTime.prototype, "inNeed", void 0);
__decorate([
    property({ type: Array })
], ProgressOverTime.prototype, "data", void 0);
__decorate([
    property({ type: String })
], ProgressOverTime.prototype, "widgetTitle", void 0);
__decorate([
    property({ type: Number, computed: '_fromJSON(target)' })
], ProgressOverTime.prototype, "actualTarget", void 0);
__decorate([
    property({ type: Number, computed: '_fromJSON(inNeed)' })
], ProgressOverTime.prototype, "actualInNeed", void 0);
__decorate([
    property({ type: Array })
], ProgressOverTime.prototype, "cols", void 0);
__decorate([
    property({ type: Array, computed: '_computeRowsLocal(data, actualTarget, actualInNeed)' })
], ProgressOverTime.prototype, "rows", void 0);
window.customElements.define('progress-over-time', ProgressOverTime);
