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
import '../../etools-prp-number';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class NumberOfNonClusterActivities extends LocalizeMixin(ReduxConnectedElement) {
    static get template() {
        return html `
    ${dashboardWidgetStyles}
    <style include="iron-flex iron-flex-alignment">
      :host {
        display: block;
      }
    </style>

    <paper-card class="widget-container">
      <div class="layout horizontal justified">
        <div class="self-center">
          <h3 class="widget-heading">[[localize('number_of_non_cluster')]]</h3>
        </div>
        <div>
          <div class="widget-figure">
            <etools-prp-number value="[[numberOfActivities]]"></etools-prp-number>
          </div>
        </div>

        <etools-loading active="[[loading]]"></etools-loading>
      </div>
    </paper-card>
    `;
    }
}
__decorate([
    property({ type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_non_cluster_activities)' })
], NumberOfNonClusterActivities.prototype, "numberOfActivities", void 0);
__decorate([
    property({ type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)' })
], NumberOfNonClusterActivities.prototype, "loading", void 0);
window.customElements.define('number-of-non-cluster-activities', NumberOfNonClusterActivities);
export { NumberOfNonClusterActivities as NumberOfNonClusterActivitiesEl };
