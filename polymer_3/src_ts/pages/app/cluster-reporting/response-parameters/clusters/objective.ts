import {ReduxConnectedElement} from '../../../../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-location/iron-location';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/iron-location/iron-query-params';
import {EtoolsPrpAjaxEl} from '../../../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/overview';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/indicators';
import '../../../../../elements/cluster-reporting/response-parameters/clusters/objectives/activities';
import '../../../../../etools-prp-common/elements/page-header';
import '../../../../../etools-prp-common/elements/page-body';
import '../../../../../elements/page-badge';
import '../../../../../etools-prp-common/elements/project-status';
import UtilsMixin from '../../../../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../../../../etools-prp-common/mixins/localize-mixin';
import RoutingMixin from '../../../../../etools-prp-common/mixins/routing-mixin';
import Endpoints from '../../../../../etools-prp-common/endpoints';
import {sharedStyles} from '../../../../../styles/shared-styles';
import {GenericObject} from '../../../../../etools-prp-common/typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 * @appliesMixin RoutingMixin
 */
class Objective extends LocalizeMixin(UtilsMixin(RoutingMixin(ReduxConnectedElement))) {
  static get template() {
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
          }
        }

        .toolbar report-status {
          margin-right: 1em;
        }

        .toolbar a {
          text-decoration: none;
        }

        .tabs paper-tab {
          text-transform: uppercase;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <etools-prp-ajax id="objective" url="[[objectiveUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

      <app-route route="{{route}}" pattern="/:tab" subroute="{{subroute}}" data="{{routeData}}"> </app-route>

      <page-header title="[[data.title]]" back="[[backLink]]">
        <page-badge slot="above-title" name="[[localize('objective')]]"> </page-badge>

        <div class="toolbar">
          <project-status status="[[data.status]]"></project-status>
        </div>

        <div slot="tabs">
          <paper-tabs selected="{{routeData.tab}}" attr-for-selected="name" scrollable hide-scroll-buttons>
            <paper-tab name="overview">[[localize('overview')]]</paper-tab>
            <paper-tab name="indicators">[[localize('cluster_objective_indicators')]]</paper-tab>
            <paper-tab name="activities">[[localize('cluster_activity')]]</paper-tab>
          </paper-tabs>
        </div>
      </page-header>

      <template is="dom-if" if="[[_equals(tab, 'overview')]]" restamp="true">
        <rp-clusters-details-overview data="[[data]]"></rp-clusters-details-overview>
      </template>

      <template is="dom-if" if="[[_equals(tab, 'indicators')]]" restamp="true">
        <rp-clusters-details-indicators
          objective-id="[[objectiveId}}"
          activity-data="[[data]]"
          cluster-id="[[data.cluster]]"
        >
        </rp-clusters-details-indicators>
      </template>

      <template is="dom-if" if="[[_equals(tab, 'activities')]]" restamp="true">
        <rp-clusters-details-activities objective-id="{{objectiveId}}"> </rp-clusters-details-activities>
      </template>
    `;
  }

  @property({type: String})
  tab!: string;

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: String})
  objectiveId!: string;

  @property({type: Object})
  data = {};

  @property({type: String, computed: '_computeObjectiveUrl(objectiveId)'})
  objectiveUrl!: string;

  @property({type: String, computed: '_computeBackLink(query)'})
  backLink!: string;

  @property({type: Boolean})
  updatePending = false;

  static get observers() {
    return ['_updateUrlTab(routeData.tab)', '_getObjectiveAjax(objectiveUrl)'];
  }

  _onSuccess() {
    this._getObjectiveAjax();
  }

  _updateUrlTab(tab: string) {
    if (!tab) {
      tab = 'overview';
    }
    this.set('tab', tab);
    this.set('route.path', '/' + this.tab);
  }

  _computeObjectiveUrl(objectiveId: string) {
    if (!objectiveId) {
      return;
    }
    return Endpoints.responseParametersClustersObjectiveDetail(objectiveId);
  }

  _computeBackLink(query: string) {
    return '/response-parameters/clusters/objectives' + '?' + query;
  }

  _getObjectiveAjax() {
    if (!this.objectiveUrl) {
      return;
    }
    const thunk = (this.$.objective as EtoolsPrpAjaxEl).thunk();
    thunk()
      .then((res: any) => {
        this.updatePending = false;
        this.data = res.data;
      })
      .catch((_err: GenericObject) => {
        this.updatePending = false;
        //   // TODO: error handling
      });
  }

  _addEventListeners() {
    this._onSuccess = this._onSuccess.bind(this);
    this.addEventListener('objective-edited', this._onSuccess);
  }

  _removeEventListeners() {
    this.removeEventListener('objective-edited', this._onSuccess);
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

window.customElements.define('clusters-objective-details', Objective);

export {Objective as ClustersObjectiveDetailsEl};
