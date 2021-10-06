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
class PartnersPerCluster extends LocalizeMixin(UtilsMixin(AnalysisChartMixin(ReduxConnectedElement))) {
    constructor() {
        super(...arguments);
        this.widgetTitle = 'Partners per Cluster';
        this.cols = [
            {
                label: 'Cluster',
                type: 'string'
            },
            {
                label: 'Count',
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

    <analysis-widget
        widget-title="[[_localizeLowerCased(widgetTitle, localize)]]"
        loading="[[loading]]">
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
          message="No data for [[widgetTitle]].">
      </list-placeholder>
    </analysis-widget>
    `;
    }
    _computeOptions(rows) {
        return Object.assign({}, this._baseOptions, {
            height: rows.length * 45 + 30,
            colors: rows.map(function () {
                return '#88c245';
            })
        });
    }
}
__decorate([
    property({ type: String })
], PartnersPerCluster.prototype, "widgetTitle", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.analysis.operationalPresence.dataLoading)' })
], PartnersPerCluster.prototype, "loading", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.analysis.operationalPresence.data.partners_per_cluster)' })
], PartnersPerCluster.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], PartnersPerCluster.prototype, "cols", void 0);
__decorate([
    property({ type: Array, computed: '_computeRows(data)' })
], PartnersPerCluster.prototype, "rows", void 0);
window.customElements.define('partners-per-cluster', PartnersPerCluster);
