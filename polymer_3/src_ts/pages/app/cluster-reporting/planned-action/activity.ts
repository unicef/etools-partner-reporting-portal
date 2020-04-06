import {ReduxConnectedElement} from '../../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-tabs/paper-tab';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import RoutingMixin from '../../../../mixins/routing-mixin';
import Endpoints from '../../../../endpoints';
import '../../../../elements/cluster-reporting/planned-action/activities/overview';
import '../../../../elements/cluster-reporting/planned-action/activities/indicators';
import '../../../../elements/etools-prp-ajax';
import '../../../../elements/page-header';
import '../../../../elements/project-status';
import '../../../../elements/page-badge';
import {sharedStyles} from '../../../../styles/shared-styles';
import {GenericObject} from '../../../../typings/globals.types';
import {EtoolsPrpAjaxEl} from '../../../../elements/etools-prp-ajax';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin RoutingMixin
 * @appliesMixin LocalizeMixin
 */
class PlannedActionActivitiesDetails extends LocalizeMixin(RoutingMixin(UtilsMixin(ReduxConnectedElement))) {

  public static get template() {
    return html`
    ${sharedStyles}
    <style>
    :host {
      display: block;

      --page-header-above-title: {
        position: absolute;
        display: block;
        left: 0;
        top: -23px;
      };
    }

    .toolbar report-status {
      margin-right: 1em;
    }

    .toolbar a {
      color: var(--theme-primary-color);
      text-decoration: none;
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

    <etools-prp-ajax
      id="overview"
      url="[[overviewUrl]]"
      params="[[queryParams]]">
    </etools-prp-ajax>

    <etools-prp-ajax
      id="projects"
      url="[[projectsUrl]]">
    </etools-prp-ajax>

    <app-route
      route="{{route}}"
      pattern="/:tab"
      subroute="{{subroute}}"
      data="{{routeData}}">
    </app-route>

    <page-header
        title="[[activityData.title]]"
        back="[[backLink]]">

      <page-badge
        slot="above-title" name="[[localize('activity')]]">
      </page-badge>

      <div class="toolbar">
        <project-status status="[[activityData.status]]"></project-status>
      </div>

      <div slot="tabs">
        <paper-tabs
            selected="{{ routeData.tab }}"
            attr-for-selected="name"
            scrollable
            hide-scroll-buttons>
          <paper-tab name="overview">[[localize('overview')]]</paper-tab>
          <paper-tab name="indicators">[[localize('activity_indicators')]]</paper-tab>
        </paper-tabs>
      </div>
    </page-header>

    <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
      <pa-activity-details-overview activity-data="[[activityData]]"></pa-activity-details-overview>
    </template>

    <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
      <pa-activity-details-indicators
        activity-id="[[activityId]]"
        activity-data="[[activityData]]"
        is-custom="[[activityData.is_custom]]">
      </pa-activity-details-indicators>
    </template>
`;
  }

  @property({type: String})
  tab!: string;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: String})
  activityId!: string;

  @property({type: String})
  query!: string;

  @property({type: Object})
  activityData: GenericObject = {};

  @property({type: Object})
  projects: GenericObject = {};

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Object, computed: 'getReduxStateObject(rootState.partner.current)'})
  partner!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: String, computed: '_computeOverviewUrl(responsePlanID, activityId)'})
  overviewUrl!: string;

  @property({type: String, computed: '_computeBackLink(query)'})
  backLink!: string;


  static get observers() {
    return [
      '_updateUrlTab(routeData.tab)',
      '_getActivityAjax(projects)',
      '_getProjects(responsePlanID)'
    ];
  }

  _onSuccess() {
    if (this.projects === undefined) {
      this._getProjects();
    }
    this._getActivityAjax();
  }

  _computeBackLink() {
    return '/planned-action/activities' + '?' + this.query;
  }

  _updateTabSelection() {
    this.$.tabContent.select(this.tab);
  }

  _updateUrlTab(tab: string) {
    if (!tab) {
      tab = 'overview';
    }
    this.set('tab', tab);
    this.set('queryParams.page', 1);
    this.set('route.path', '/' + this.tab);
  }

  _computeOverviewUrl(responsePlanId: string, activityId: string) {
    if (!responsePlanId) {
      return;
    }
    return Endpoints.plannedActionsActivityOverview(responsePlanId, activityId);
  }

  _getActivityAjax() {
    if (this.projects === undefined || this.queryParams === undefined) {
      return;
    }
    const self = this;
    const thunk = (this.$.overview as EtoolsPrpAjaxEl).thunk();
    thunk()
      // @ts-ignore
      .then(function(res) {
        self.updatePending = false;
        res.data.projects.forEach(function(project: GenericObject) {
          project.title = self.projects[project.project_id].title;
        });
        self.activityData = res.data;
      })
      .catch(function(err) {
        self.updatePending = false;
        // TODO: error handling
      });
  }

  _getProjects() {
    if (!this.responsePlanID) {
      return;
    }
    const self = this;
    const projectsThunk = (this.$.projects as EtoolsPrpAjaxEl).thunk();

    this.set('projectsUrl', Endpoints.plannedActions(this.responsePlanID));

    projectsThunk()
      .then(function(res) {
        let allProjects: GenericObject = {};
        res.data.results.forEach(function(project) {
          allProjects[project.id] = project;
        });

        self.set('projects', allProjects);
      });
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('pa-activity-edited', this._onSuccess);
  }

  connectedCallback() {
    super.connectedCallback();

    this._addEventListeners();
  }

  _removeEventListeners() {
    this.removeEventListener('pa-activity-edited', this._onSuccess);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
  }

}

window.customElements.define('planned-action-activities-details', PlannedActionActivitiesDetails);
