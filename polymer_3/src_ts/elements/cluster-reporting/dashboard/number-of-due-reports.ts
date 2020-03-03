import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/iron-location/iron-query-params';
import {dashboardWidgetStyles} from '../../../styles/dashboard-widget-styles'
import LocalizeMixin from '../../../mixins/localize-mixin';
import RoutingMixin from '../../../mixins/routing-mixin';
import '../../etools-prp-number';
import { GenericObject } from '../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class NumberOfDueReports extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
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

  @property({type: String})
  resultsQuery!: string;

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_due_overdue_indicator_reports)'})
  numberOfReports!: number;

  @property({type: String, computed: '_computeReportsUrl(_baseUrlCluster, resultsQuery)'})
  reportsUrl!: string;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)'})
  loading!: boolean;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  partner!: GenericObject;

  @property({type: Object, computed: '_computeResultsQueryParams(partner)'})
  resultsQueryParams!: GenericObject;

  _computeReportsUrl(baseUrl: string, query: string) {
    return this.buildUrl(baseUrl, '/results?' + query);
  }

  _computeResultsQueryParams(partner: GenericObject) {
    return {
      partner: partner.id,
    };
  }
}

window.customElements.define('number-of-due-reports', NumberOfDueReports);

export {NumberOfDueReports as NumberOfDueReportsEl};
