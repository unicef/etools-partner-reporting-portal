import {ReduxConnectedElement} from '../../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import '@polymer/iron-location/iron-location';
import '../../../../../elements/cluster-reporting/response-parameters/partners/projects/overview';
import '../../../../../elements/cluster-reporting/response-parameters/partners/projects/indicators';
import '../../../../../elements/cluster-reporting/response-parameters/partners/projects/activities';
import '../../../../../elements/page-body';
import '../../../../../elements/page-header';
import '../../../../../elements/page-badge';
import {EtoolsPrpAjaxEl} from '../../../../../elements/etools-prp-ajax';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import Endpoints from '../../../../../endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {GenericObject} from '../../../../../typings/globals.types';

/**
* @polymer
* @customElement
* @appliesMixin UtilsMixin
* @appliesMixin LocalizeMixin
*/
class Project extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {

  static get template() {
    return html`
    <style>
      :host {
        display: block;
      }
      .tabs paper-tab {
        text-transform: uppercase;
      }
    </style>

    <iron-location
      query="{{query}}">
    </iron-location>

    <etools-prp-ajax
      id="project"
      url="[[overviewUrl]]">
    </etools-prp-ajax>

    <app-route
      route="{{parentRoute}}"
      pattern="/:id"
      data="{{parentRouteData}}"
      tail="{{route}}">
    </app-route>

    <app-route
      route="{{route}}"
      pattern="/:tab"
      data="{{routeData}}">
    </app-route>

    <page-header
        title="[[projectData.title]]"
        back="[[backLink]]">

      <page-badge
        slot="above-title" name="[[localize('project')]]">
      </page-badge>

      <div slot="toolbar">
        <project-status status="[[projectData.status]]"></project-status>
      </div>

      <div slot="tabs">
        <paper-tabs
            selected="{{routeData.tab}}"
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="overview">[[localize('overview')]]</paper-tab>
          <paper-tab name="indicators">[[localize('project_indicators')]]</paper-tab>
          <paper-tab name="activities">[[localize('activities')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
      <rp-partner-project-details-overview
          project-data="[[projectData]]">
      </rp-partner-project-details-overview>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
      <rp-partner-project-details-indicators
          project-id="[[parentRouteData.id]]"
          project-data="[[projectData]]">
      </rp-partner-project-details-indicators>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'activities')]]" restamp="true">
      <rp-partner-project-details-activities
          project-data="[[projectData]]"
          project-id="[[parentRouteData.id]]">
      </rp-partner-project-details-activities>
    </template>
    `;
  }

  @property({type: Object})
  parentRouteData!: GenericObject;

  @property({type: String})
  tab!: string;

  @property({type: Object})
  projectData = {};

  @property({type: String, computed: '_computeOverviewUrl(parentRouteData.id)', observer: '_getProjectAjax'})
  overviewUrl!: string;

  @property({type: String, computed: '_computeBackLink(query)'})
  backLink!: string;

  @property({type: Boolean})
  updatePending = false;

  static get observers() {
    return [
      '_updateUrlTab(routeData.tab)'
    ]
  }

  private _projectAjaxDebouncer!: Debouncer;

  _computeBackLink(query: string) {
    return '/response-parameters/partners/projects' + '?' + query;
  }

  _computeOverviewUrl(projectId: string) {
    return Endpoints.plannedActionsProjectOverview(projectId);
  }

  _updateTabSelection() {
    this.$.tabContent.select(this.tab);
  }

  _updateUrlTab(tab: string) {
    if (!tab) {
      tab = 'overview';
    }

    this.set('tab', tab);
    this.notifyPath('route.path', '/' + this.tab);
  }

  _onSuccess() {
    this._getProjectAjax();
  }

  _getProjectAjax() {
    if (!this.overviewUrl) {
      return;
    }

    this._projectAjaxDebouncer = Debouncer.debounce(this._projectAjaxDebouncer,
      timeOut.after(100),
      () => {
        const thunk = (this.$.project as EtoolsPrpAjaxEl).thunk();
        let self = this;

        thunk()
          .then(function(res: any) {
            self.updatePending = false;
            self.projectData = res.data;
          })
          .catch(function(err: any) {
            self.updatePending = false;
            //   // TODO: error handling
          });
      });
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('project-edited', this._onSuccess);
  }

  _removeEventListeners() {
    this.removeEventListener('project-edited', this._onSuccess);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    if (this._projectAjaxDebouncer && this._projectAjaxDebouncer.isActive()) {
      this._projectAjaxDebouncer.cancel();
    }
  }
}

window.customElements.define('rp-partners-project-detail', Project);

export {Project as RpPartnersProjectDetailEl};
