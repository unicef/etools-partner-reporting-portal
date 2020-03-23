import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import '@polymer/iron-location/iron-location';
// <link rel="import" href="../../../../../../bower_components/app-localize-behavior/app-localize-behavior.html">
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import RoutingMixin from '../../../../../mixins/routing-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import {sharedStyles} from '../../../../../styles/shared-styles';
import '../../../../../elements/filters/cluster-filter/filter-list-by-cluster';
import './router';
import {GenericObject} from '../../../../../typings/globals.types';

/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin RoutingMixin
* @appliesMixin LocalizeMixin
*/
class Partners extends RoutingMixin(UtilsMixin(LocalizeMixin(ReduxConnectedElement))) {

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

    <iron-location query="{{query}}">
    </iron-location>

    <iron-query-params params-string="{{query}}" params-object="{{queryParams}}">
    </iron-query-params>

    <app-route route="{{route}}" pattern="/:subpage" data="{{routeData}}" tail="{{subroute}}">
    </app-route>

    <template is="dom-if" if="[[_displayHeader(subpage)]]" restamp="true">
      <div class="page-top-content">
        <page-header title="[[localize('partners')]]">

          <div slot="toolbar" class="toolbar horizontal end-justified layout">
            <filter-list-by-cluster></filter-list-by-cluster>
          </div>

          <div slot="tabs">
            <paper-tabs selected="{{routeData.subpage}}" attr-for-selected="name" on-iron-activate="_resetPage"
              scrollable hide-scroll-buttons>

              <paper-tab name="projects">
                <span class="tab-content">[[localize('projects')]]</span>
              </paper-tab>

              <paper-tab name="activities">
                <span class="tab-content">[[localize('partner_activities')]]</span>
              </paper-tab>
            </paper-tabs>
          </div>
        </page-header>
      </div>
    </template>

    <response-parameters-partners-router parent-route="{{route}}">
    </response-parameters-partners-router>
    `;
  }

  @property({type: String})
  subpage!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  static get observers() {
    return [
      '_routeChanged(routeData.subpage)'
    ];
  }

  _routeChanged(subpage: string) {
    if (!subpage) {
      setTimeout(() => {
        this.set('route.path', '/projects');
      });
    } else if (subpage !== this.subpage) {
      this.subpage = subpage;
    }
  }

  _displayHeader(subpage: string) {
    const requiresHeader = ['projects', 'contacts', 'activities'];
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

window.customElements.define('partners-response-parameters', Partners);

export {Partners as PartnersResponseParametersEl};
