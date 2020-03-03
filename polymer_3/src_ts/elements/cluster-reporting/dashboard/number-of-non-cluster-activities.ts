import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-location/iron-query-params';
import {dashboardWidgetStyles} from '../../../styles/dashboard-widget-styles'
import LocalizeMixin from '../../../mixins/localize-mixin';
import '../../etools-prp-number';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class NumberOfNonClusterActivities extends LocalizeMixin(ReduxConnectedElement) {
  public static get template() {
    return html`
    ${dashboardWidgetStyles}
    <style include="dashboard-widget-styles iron-flex iron-flex-alignment">
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
  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_non_cluster_activities)'})
  numberOfActivities!: number;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)'})
  loading!: boolean;
}

window.customElements.define('number-of-non-cluster-activities', NumberOfNonClusterActivities);

export {NumberOfNonClusterActivities as NumberOfNonClusterActivitiesEl};
