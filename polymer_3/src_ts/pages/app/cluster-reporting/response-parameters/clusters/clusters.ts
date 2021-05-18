import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/polymer/lib/elements/dom-if';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import {sharedStyles} from '../../../../../styles/shared-styles';
import '../../../../../elements/page-header';
import '../../../../../elements/filters/cluster-filter/filter-list-by-cluster';
import './router';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class Clusters extends LocalizeMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement))) {
  static get template() {
    return html`
      ${sharedStyles}
      <style include="iron-flex iron-flex-alignment">
        :host {
          display: block;
        }

        page-header {
          padding-top: 0;
        }

        .tabs paper-tab {
          text-transform: uppercase;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <app-route route="{{route}}" pattern="/:subpage" data="{{routeData}}" tail="{{subroute}}"> </app-route>

      <template is="dom-if" if="[[_displayHeader(subpage)]]" restamp="true">
        <div class="page-top-content">
          <page-header title="[[localize('clusters')]]">
            <div slot="toolbar" class="toolbar horizontal end-justified layout">
              <filter-list-by-cluster></filter-list-by-cluster>
            </div>

            <div slot="tabs">
              <paper-tabs
                selected="{{routeData.subpage}}"
                attr-for-selected="name"
                on-iron-activate="_resetPage"
                scrollable
                hide-scroll-buttons
              >
                <paper-tab name="objectives">
                  <span class="tab-content">[[localize('objectives')]]</span>
                </paper-tab>

                <paper-tab name="activities">
                  <span class="tab-content">[[localize('cluster_activities')]]</span>
                </paper-tab>

                <paper-tab name="disaggregations">
                  <span class="tab-content">[[localize('disaggregations')]]</span>
                </paper-tab>
              </paper-tabs>
            </div>
          </page-header>
        </div>
      </template>

      <response-parameters-clusters-router route="{{subroute}}" page="{{subpage}}">
      </response-parameters-clusters-router>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  subroute!: string;

  @property({type: String})
  subpage!: string;

  static get observers() {
    return ['_routeChanged(routeData.subpage)'];
  }

  _routeChanged(subpage: string) {
    if (!subpage) {
      setTimeout(() => {
        this.set('route.path', '/objectives');
      });
    } else {
      this.subpage = subpage;
    }
  }

  _displayHeader(subpage: string) {
    const requiresHeader = ['objectives', 'activities', 'disaggregations', 'response-plans'];
    return this._displayClusterHeader(subpage, requiresHeader);
  }

  _resetPage(e: CustomEvent) {
    let isSelected = false;
    const queryParams: GenericObject = {};

    try {
      isSelected = e.detail.item.classList.contains('iron-selected');
      // eslint-disable-next-line no-empty
    } catch (err) {}

    if (isSelected) {
      return;
    }

    // Cluster filtering should persist across tabs.
    if (this.queryParams.cluster_id) {
      queryParams.cluster_id = this.queryParams.cluster_id;
    }
    this.set('queryParams', queryParams);
  }
}

window.customElements.define('clusters-response-parameters', Clusters);

export {Clusters as ClustersResponseParametersEl};
