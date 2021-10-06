var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-location/iron-query-params';
import { dashboardWidgetStyles } from '../../../styles/dashboard-widget-styles';
import LocalizeMixin from '../../../mixins/localize-mixin';
import RoutingMixin from '../../../mixins/routing-mixin';
import '../../etools-prp-number';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class NumberOfDueReports extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
    static get template() {
        return html `
    ${dashboardWidgetStyles}
    <style include="iron-flex">
      :host {
        display: block;
      }
    </style>

    <iron-query-params
        params-string="{{resultsQuery}}"
        params-object="{{resultsQueryParams}}">
    </iron-query-params>

    <paper-card class="widget-container layout vertical">
      <h3 class="widget-heading flex">[[localize('number_of_due')]]</h3>

      <div class="widget-figure flex">
        <etools-prp-number value="[[numberOfReports]]"></etools-prp-number>
      </div>


      <div class="widget-actions">
        <a href="[[reportsUrl]]">[[localize('see_all_reports')]]</a>
      </div>

      <etools-loading active="[[loading]]"></etools-loading>
    </paper-card>
    `;
    }
    _computeReportsUrl(baseUrl, query) {
        return this.buildUrl(baseUrl, '/results?' + query);
    }
    _computeResultsQueryParams(partner) {
        return {
            partner: partner.id
        };
    }
}
__decorate([
    property({ type: String })
], NumberOfDueReports.prototype, "resultsQuery", void 0);
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_due_overdue_indicator_reports)' })
], NumberOfDueReports.prototype, "numberOfReports", void 0);
__decorate([
    property({ type: String, computed: '_computeReportsUrl(_baseUrlCluster, resultsQuery)' })
], NumberOfDueReports.prototype, "reportsUrl", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)' })
], NumberOfDueReports.prototype, "loading", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partner.current)' })
], NumberOfDueReports.prototype, "partner", void 0);
__decorate([
    property({ type: Object, computed: '_computeResultsQueryParams(partner)' })
], NumberOfDueReports.prototype, "resultsQueryParams", void 0);
window.customElements.define('number-of-due-reports', NumberOfDueReports);
export { NumberOfDueReports as NumberOfDueReportsEl };
