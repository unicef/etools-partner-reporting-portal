import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import '@polymer/iron-location/iron-location';
import '../../../../../elements/cluster-reporting/response-parameters/partners/activities/overview';
import '../../../../../elements/cluster-reporting/response-parameters/partners/activities/indicators';
import '../../../../../etools-prp-common/elements/page-body';
import '../../../../../etools-prp-common/elements/page-header';
import '../../../../../elements/page-badge';
import {EtoolsPrpAjaxEl} from '../../../../../etools-prp-common/elements/etools-prp-ajax';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import Endpoints from '../../../../../etools-prp-common/endpoints';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class Activity extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
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

      <iron-location query="{{query}}"> </iron-location>

      <etools-prp-ajax id="activity" url="[[overviewUrl]]"> </etools-prp-ajax>

      <app-route route="{{parentRoute}}" pattern="/:id" data="{{parentRouteData}}" tail="{{route}}"> </app-route>

      <app-route route="{{route}}" pattern="/:tab" data="{{routeData}}"> </app-route>

      <page-header title="[[activityData.title]]" back="[[backLink]]">
        <page-badge slot="above-title" name="[[localize('partner_activity')]]"> </page-badge>

        <div slot="toolbar">
          <project-status status="[[activityData.status]]"></project-status>
        </div>

        <div slot="tabs">
          <paper-tabs selected="{{routeData.tab}}" attr-for-selected="name" scrollable hide-scroll-buttons>
            <paper-tab name="overview">[[localize('overview')]]</paper-tab>
            <paper-tab name="indicators">[[localize('activity_indicators')]]</paper-tab>
          </paper-tabs>
        </div>
      </page-header>

      <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
        <rp-partner-activity-details-overview activity-data="[[activityData]]"> </rp-partner-activity-details-overview>
      </template>

      <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
        <rp-partner-activity-details-indicators
          activity-id="[[parentRouteData.id]]"
          activity-data="[[activityData]]"
          is_custom="[[activityData.is_custom]]"
        >
        </rp-partner-activity-details-indicators>
      </template>
    `;
  }

  @property({type: String})
  tab!: string;

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  parentRouteData!: GenericObject;

  @property({type: String, computed: 'getReduxStateValue(rootState.responsePlans.currentID)'})
  responsePlanID!: string;

  @property({type: Object})
  activityData = {};

  @property({
    type: String,
    computed: '_computeOverviewUrl(responsePlanID, parentRouteData.id)',
    observer: '_getActivityAjax'
  })
  overviewUrl!: string;

  @property({type: String, computed: '_computeBackLink(query)'})
  backLink!: string;

  @property({type: Boolean})
  updatePending = false;

  static get observers() {
    return ['_updateUrlTab(routeData.tab)'];
  }

  private _activityAjaxDebouncer!: Debouncer;

  _onSuccess() {
    this._getActivityAjax();
  }

  _computeBackLink(query: string) {
    return '/response-parameters/partners/activities' + '?' + query;
  }

  _computeOverviewUrl(responsePlanID: string, activityId: string) {
    if (!responsePlanID || !activityId) {
      return;
    }
    return Endpoints.plannedActionsActivityOverview(responsePlanID, activityId);
  }

  _updateUrlTab(tab: string) {
    if (!tab) {
      tab = 'overview';
    }

    this.set('tab', tab);
    this.set('route.path', '/' + this.tab);
  }

  _getActivityAjax() {
    if (!this.overviewUrl) {
      return;
    }
    this._activityAjaxDebouncer = Debouncer.debounce(this._activityAjaxDebouncer, timeOut.after(100), () => {
      const thunk = (this.$.activity as EtoolsPrpAjaxEl).thunk();

      thunk()
        .then((res: any) => {
          this.updatePending = false;
          this.activityData = res.data;
        })
        .catch((_err: GenericObject) => {
          this.updatePending = false;
          // TODO: error handling
        });
    });
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('pa-activity-edited', this._onSuccess);
  }

  _removeEventListeners() {
    this.removeEventListener('pa-activity-edited', this._onSuccess);
  }

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    if (this._activityAjaxDebouncer && this._activityAjaxDebouncer.isActive()) {
      this._activityAjaxDebouncer.cancel();
    }
  }
}

window.customElements.define('rp-partners-activity-detail', Activity);

export {Activity as RpPartnersActivityDetailEl};
