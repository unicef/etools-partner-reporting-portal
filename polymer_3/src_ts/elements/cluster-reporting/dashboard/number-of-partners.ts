import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import {dashboardWidgetStyles} from '../../../styles/dashboard-widget-styles'
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
class NumberOfPartners extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
    ${dashboardWidgetStyles}
    <style include="iron-flex">
      :host {
        display: block;
      }
    </style>

    <paper-card class="widget-container layout vertical">
      <h3 class="widget-heading flex">[[localize('number_of_contributing_partners')]]</h3>

      <div class="widget-figure flex">
        <etools-prp-number value="[[numberOfPartners]]"></etools-prp-number>
      </div>
      <etools-loading active="[[loading]]"></etools-loading>
    </paper-card>
    `;
  }

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_partners)'})
  numberOfPartners = null;

  @property({type: String, computed: '_computePartnersUrl(_baseUrlCluster)'})
  partnersUrl!: string;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)'})
  loading!: boolean;

  _computePartnersUrl(baseUrl: string) {
    return this.buildUrl(baseUrl, '/response-parameters/partners');
  }

}

window.customElements.define('number-of-partners', NumberOfPartners);

export {NumberOfPartners as NumberOfPartnersEl};
