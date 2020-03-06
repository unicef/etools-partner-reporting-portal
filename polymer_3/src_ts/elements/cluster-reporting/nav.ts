import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import '@polymer/paper-item/paper-item';
import '@polymer/app-route/app-route';
import '@polymer/iron-icon/iron-icon';
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-icons/av-icons';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import LocalizeMixin from '../../mixins/localize-mixin';
//import '@polymer/paper-divider/paper-divider.js';
import '@polymer/paper-listbox/paper-listbox';
import UtilsMixin from '../../mixins/utils-mixin';
import PageNavMixin from '../../mixins/page-nav-mixin';
import RoutingMixin from '../../mixins/routing-mixin';
import '../etools-prp-permissions';
import {pageNavStyles} from '../../styles/page-nav-styles';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject, Route} from '../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin PageNavMixin
 * @appliesMixin RoutingMixin
 */
class ClusterReportingNav extends LocalizeMixin(UtilsMixin(PageNavMixin(RoutingMixin(ReduxConnectedElement)))) {
  public static get template() {
    return html`
        ${pageNavStyles}
        <style>
          :host {
            --paper-item-selected: {
              color: var(--theme-primary-color);
              background: var(--theme-selected-item-background-color);
            };
          }
        </style>

        <etools-prp-permissions
          permissions="{{ permissions }}">
        </etools-prp-permissions>

        <app-route route="{{route}}"></app-route>

        <iron-location
          query="{{query}}">
        </iron-location>

        <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
        </iron-query-params>

        <paper-listbox
          id="menu"
          selected="{{ selected }}"
          attr-for-selected="name"
          selectable=".selectable"
          key-event-target="null">

          <div class="nav-content">
            <div>
              <paper-item name="dashboard" class="selectable">
                <a href="[[_appendQuery(dashboardUrl, clusterQuery)]]">
                  <span><iron-icon icon="view-quilt" role="presentation"></iron-icon>[[localize('dashboard')]]</span>
                </a>
              </paper-item>

              <div name="response-parameters" class="selectable">
                <paper-listbox>
                  <paper-item class="menu-trigger">
                    <a href="[[_appendQuery(responseParametersUrl, clusterQuery)]]">
                      <span><iron-icon icon="compare-arrows" role="presentation"></iron-icon>[[localize('response_parameters')]]</span>
                    </a>
                  </paper-item>
                  <paper-listbox class="menu-content">
                    <paper-item name="response-parameters" id="clustersSubmenu" class$="[[clustersSelected]]">
                      <a href="[[_appendQuery(clustersUrl, clusterQuery)]]">[[localize('clusters')]]</a>
                    </paper-item>
                    <paper-item name="response-parameters" id="partnersSubmenu" class$="[[partnersSelected]]">
                      <a href="[[_appendQuery(partnersUrl, clusterQuery)]]">[[localize('partners')]]</a>
                      </a>
                    </paper-item>
                  </paper-listbox>
                </paper-listbox>
              </div>

              <template
                is="dom-if"
                if="[[canViewPlannedAction]]"
                restamp="true">
                <paper-item name="planned-action" class="selectable">
                  <a href="[[_appendQuery(plannedActionUrl, clusterQuery)]]">
                <span><iron-icon icon="av:playlist-add"
                                 role="presentation"></iron-icon>[[localize('my_planned_action')]]</span>
                  </a>
                </paper-item>
              </template>

              <paper-item name="results" class="selectable">
                <a href="[[_appendQuery(resultsUrl, clusterQuery, partnerQuery)]]">
                  <span><iron-icon icon="trending-up"
                                   role="presentation"></iron-icon>[[localize('reporting_results')]]</span>
                </a>
              </paper-item>

              <paper-item name="analysis" class="selectable">
                <a href="[[_appendQuery(analysisUrl, clusterQuery, analysisQuery, partnerQuery)]]">
                  <span><iron-icon icon="av:equalizer" role="presentation"></iron-icon>[[localize('analysis')]]</span>
                </a>
              </paper-item>

              <template is="dom-if" if="[[permissions.accessClusterIdManagement]]" restamp="true">
               <!-- <paper-divider></paper-divider> -->

                <paper-item name="id-management" id="id-management" on-tap="goToIdManagement">
                  <a href="/id-management/cluster-reporting/">
                    <span><iron-icon icon="social:people"
                                     role="presentation"></iron-icon>[[localize('id_management')]]</span>
                  </a>
                </paper-item>
              </template>
            </div>

            <div>
            <!-- <paper-divider></paper-divider> -->
              <paper-item name="indicators">
                <a href="https://prphelp.zendesk.com/" target="_blank">
                  <span><iron-icon icon="communication:import-contacts" role="presentation"></iron-icon>[[localize('knowledge_base')]]</span>
                </a>
              </paper-item>
            </div>
          </div>
        </paper-listbox>
      `;
  }

  @property({type: Object})
  route!: Route;

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  clustersSelected!: string;

  @property({type: String})
  partnersSelected!: string;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  partner!: GenericObject;

  @property({type: Object, computed: '_computePartnerQuery(partner)'})
  partnerQuery!: GenericObject;

  @property({type: Object, computed: '_computeClusterQuery(queryParams)'})
  clusterQuery!: GenericObject;

  @property({type: Object})
  analysisQuery: GenericObject = {
    loc_type: 0,
  };

  @property({type: String, computed: 'buildUrl(_baseUrlCluster, \'dashboard\')'})
  dashboardUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrlCluster, \'response-parameters\')'})
  responseParametersUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrlCluster, \'response-parameters/clusters\')'})
  clustersUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrlCluster, \'response-parameters/partners\')'})
  partnersUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrlCluster, \'planned-action\')'})
  plannedActionUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrlCluster, \'results\')'})
  resultsUrl!: string;

  @property({type: String, computed: 'buildUrl(_baseUrlCluster, \'analysis\')'})
  analysisUrl!: string;

  @property({type: Boolean, computed: '_computeViewPlannedAction(permissions)'})
  canViewPlannedAction!: boolean;


  static get observers() {
    return ['_routeChanged(route)'];
  }

  goToIdManagement(e: CustomEvent) {
    e.preventDefault();
    window.location.href = '/id-management/cluster-reporting/';
  }

  _computeViewPlannedAction(permissions: GenericObject) {
    return permissions.viewPlannedAction;
  }

  //Shows the submenu item selected upon initial load.
  _routeChanged() {
    if (this.route.path.indexOf('partners') >= 0) {
      this.partnersSelected = 'iron-selected';
      this.clustersSelected = '';
    } else {
      this.clustersSelected = 'iron-selected';
      this.partnersSelected = '';
    }
  }

  _computePartnerQuery(partner: GenericObject) {
    let query: GenericObject = {};
    if (partner && partner.id) {
      query.partner = partner.id;
    }
    return query;
  }

  _computeClusterQuery(queryParams: GenericObject) {
    let query: GenericObject = {};

    if (queryParams.cluster_id) {
      query.cluster_id = queryParams.cluster_id;
    }

    return query;
  }

}

window.customElements.define('cluster-reporting-nav', ClusterReportingNav);
