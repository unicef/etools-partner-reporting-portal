import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import UtilsMixin from '../../../mixins/utils-mixin';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {GenericObject} from '../../../typings/globals.types'
import '../../../elements/page-header';
import '../../../elements/filters/cluster-filter/filter-list-by-cluster';
import './planned-action/router';
import {sharedStyles} from '../../../styles/shared-styles';

// When the user first clicks My Planned Action, this component determines whether
// to display the Planned Action page header and tabs.  It passes the page name to
// planned-action-projects-router.


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReportingPlannedAction extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  public static get template() {
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

    <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <app-route
      route="{{route}}"
      pattern="/:subpage"
      data="{{routeData}}"
      tail="{{subroute}}">
    </app-route>

    <template is="dom-if" if="[[_displayHeader(subpage)]]" restamp="true">
      <div class="page-top-content">
        <page-header title="[[localize('my_planned_action')]]">
          <div class="toolbar horizontal end-justified layout">
            <filter-list-by-cluster></filter-list-by-cluster>
          </div>
          <div slot="tabs">
            <paper-tabs
              selected="{{routeData.subpage}}"
              attr-for-selected="name"
              on-iron-activate="_resetPage"
              scrollable
              hide-scroll-buttons>

              <paper-tab name="projects">
                <span class="tab-content">[[localize('projects')]]</span>
              </paper-tab>

              <paper-tab name="activities">
                <span class="tab-content">[[localize('activities')]]</span>
              </paper-tab>
            </paper-tabs>
          </div>
        </page-header>
      </div>
    </template>

    <planned-action-projects-router
      route="{{subroute}}"
      page="{{subpage}}">
    </planned-action-projects-router>
  `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  subpage!: string;

  static get observers() {
    return [
      '_routeChanged(routeData.subpage)',
    ];
  }

  _routeChanged(subpage: string) {
    if (!subpage) {
      setTimeout(() => {
        this.set('route.path', '/projects');
      })
    } else {
      this.subpage = subpage;
    }
  }

  _displayHeader(subpage: any) {
    const requiresHeader = ['projects', 'activities'];
    return this._displayClusterHeader(subpage, requiresHeader);
  }

  _resetPage(e: CustomEvent) {
    let isSelected = false;
    const queryParams: GenericObject = {};

    try {
      isSelected = e.detail.item.classList.contains('iron-selected');
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

window.customElements.define('page-cluster-reporting-planned-action', PageClusterReportingPlannedAction);

