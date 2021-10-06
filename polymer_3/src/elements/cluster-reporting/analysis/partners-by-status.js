var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { property } from '@polymer/decorators';
import '@google-web-components/google-chart';
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
class PartnersByStatus extends LocalizeMixin(UtilsMixin(AnalysisChartMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.widgetTitle = 'Partners by Status';
        this.cols = [
            {
                label: 'Status',
                type: 'string'
            },
            {
                label: 'Count',
                type: 'number'
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
            },
            // TODO: tooltips
            enableInteractivity: false,
            tooltip: null
        });
    }
    _computeRowsLocal(data, localize) {
        var self = this;
        return Object.keys(data || {}).map(function (key) {
            return [
                self._localizeLowerCased(key, localize),
                data[key]
            ];
        });
    }
}
__decorate([
    property({ type: Object })
], PartnersByStatus.prototype, "data", void 0);
__decorate([
    property({ type: String })
], PartnersByStatus.prototype, "widgetTitle", void 0);
__decorate([
    property({ type: Array })
], PartnersByStatus.prototype, "cols", void 0);
__decorate([
    property({ type: Array, computed: '_computeRowsLocal(data, localize)' })
], PartnersByStatus.prototype, "rows", void 0);
window.customElements.define('partners-by-status', PartnersByStatus);
