import {html} from '@polymer/polymer';
import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-card/paper-card';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import {dashboardWidgetStyles} from '../../../styles/dashboard-widget-styles';
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
class NumberOfProjects extends LocalizeMixin(RoutingMixin(ReduxConnectedElement)) {
  public static get template() {
    return html`
    ${dashboardWidgetStyles}
    <style include="iron-flex">
      :host {
        display: block;
      }
    </style>

    <paper-card class="widget-container layout vertical">
      <h3 class="widget-heading flex">[[localize('number_of_projects')]]</h3>

      <div class="widget-figure flex">
        <etools-prp-number value="[[numberOfProjects]]"></etools-prp-number>
      </div>

      <div class="widget-actions">
          <a href="[[projectsUrl]]">[[localize('see_all_projects')]]</a>
      </div>

      <etools-loading active="[[loading]]"></etools-loading>
    </paper-card>
    `;
  }

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterDashboardData.data.num_of_projects_in_my_organization)'})
  numberOfProjects = null;

  @property({type: String, computed: '_computePartnersUrl(_baseUrlCluster)'})
  projectsUrl!: string;

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDashboardData.loading)'})
  loading!: boolean;

  _computePartnersUrl(baseUrl: string) {
    return this.buildUrl(baseUrl, '/planned-action/projects');
  }

}

window.customElements.define('number-of-projects', NumberOfProjects);

export {NumberOfProjects as NumberOfProjectsEl};
