
import {ReduxConnectedElement} from '../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/app-route/app-route';
import '@polymer/app-route/app-location';
import '@polymer/iron-pages/iron-pages';
import '../../elements/etools-prp-ajax';
import '../../elements/page-title';
import Endpoints from '../../endpoints';
import UtilsMixin from '../../mixins/utils-mixin';
import LocalizeMixin from '../../mixins/localize-mixin';
import {workspaceId} from '../../redux/selectors/workspace';
import {GenericObject} from '../../typings/globals.types';
import {RootState} from '../../typings/redux.types';
import {EtoolsPrpAjaxEl} from '../../elements/etools-prp-ajax';
import {getDomainByEnv} from '../../config';
import {fetchResponsePlans} from '../../redux/actions';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PageClusterReporting extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
    </style>

    <page-title title="[[localize('cluster_reporting')]]"></page-title>

    <etools-prp-ajax
        id="responsePlans"
        url="[[plansUrl]]">
    </etools-prp-ajax>

    <app-location
        query-params="{{queryParams}}">
    </app-location>

    <app-route
        route="{{route}}"
        pattern="/:page"
        data="{{routeData}}"
        tail="{{subroute}}">
    </app-route>

    <iron-pages
        selected="[[page]]"
        attr-for-selected="name">
      <template
          is="dom-if"
          if="[[_equals(page, 'select-plan')]]"
          restamp="true">
        <page-cluster-reporting-select-plan
            name="select-plan"
            route="{{subroute}}">
        </page-cluster-reporting-select-plan>
      </template>

      <template
          is="dom-if"
          if="[[_equals(page, 'router')]]">
        <page-cluster-reporting-router
            name="router"
            route="{{subroute}}">
        </page-cluster-reporting-router>
      </template>
    </iron-pages>
`;
  }


  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  subroute!: GenericObject;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String, observer: '_pageChanged'})
  page!: string;

  @property({type: String, computed: '_workspaceId(rootState)'})
  workspaceId!: string;


  @property({type: String, computed: '_computeResponsePlansUrl(workspaceId)', observer: '_fetchResponsePlans'})
  plansUrl!: string;


  static get observers() {
    return [
      '_routePageChanged(routeData.page)',
    ];
  }

  _workspaceId(rootState: RootState) {
    return workspaceId(rootState);
  }


  _routePageChanged(page: string) {
    switch (page) {
      case 'select-plan':
        this.set('page', page);
        break;

      case void 0:
      case '':
        this.set('route.path', 'select-plan');
        this.set('page', 'select-plan');
        break;

      case 'plan':
        this.set('page', 'router');
        break;
    }
  }

  async _pageChanged(page: string) {
    //const resolvedPageUrl = this.resolveUrl('cluster-reporting/' + page + '.html');
    const resolvedPageUrl = getDomainByEnv() + `/src/pages/app/cluster-reporting/${page}.js`;
    console.log('cluster loading... :' + resolvedPageUrl);
    await import(resolvedPageUrl).catch((err: any) => {
      console.log(err);
      this._notFound();
    })
  }

  _computeResponsePlansUrl(workspaceId: string) {
    return workspaceId ? Endpoints.responsePlans(workspaceId) : '';
  }

  _fetchResponsePlans(url: string) {
    if (!url) {
      return;
    }

    const responsePlansThunk = (this.$.responsePlans as EtoolsPrpAjaxEl).thunk();

    this.reduxStore.dispatch(fetchResponsePlans(responsePlansThunk))
      // @ts-ignore
      .catch(function(err) {
        // TODO: error handling
      });
  }

  _addEventListeners() {
    this._fetchResponsePlans = this._fetchResponsePlans.bind(this);
    this.addEventListener('refresh-plan-list', this._fetchResponsePlans as any);
  }

  _removeEventListeners() {
    this.removeEventListener('refresh-plan-list', this._fetchResponsePlans as any);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

}
window.customElements.define('page-cluster-reporting', PageClusterReporting);

export {PageClusterReporting as PageClusterReportingEl};
