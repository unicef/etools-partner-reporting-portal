var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import { property } from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../../etools-prp-ajax';
import '../../../../etools-prp-permissions';
import '../../../../page-body';
import '../../../indicator-modal';
import '../../../../list-view-indicators';
import Endpoints from '../../../../../endpoints';
import { clusterActivitiesIndicatorsFetch } from '../../../../../redux/actions/clusterActivities';
import { buttonsStyles } from '../../../../../styles/buttons-styles';
import { tableStyles } from '../../../../../styles/table-styles';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizeMixin
 * @appliesMixin UtilsMixin
 */
class Indicators extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
    static get template() {
        // language=HTML
        return html `
    ${buttonsStyles} ${tableStyles}
    <style include="iron-flex data-table-styles">
      :host {
        display: block;
      }

      div#action {
        margin: 25px 0;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }
    </style>

    <etools-prp-permissions
        permissions="{{permissions}}">
    </etools-prp-permissions>

    <iron-location query="{{query}}"></iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
        id="indicators"
        url="[[url]]"
        params="[[queryParams]]">
    </etools-prp-ajax>

    <page-body>
      <template
          is="dom-if"
          if="[[canAddIndicator]]"
          restamp="true">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_cluster_activity_indicator')]]
          </paper-button>
        </div>
      </template>

      <indicator-modal
        id="indicatorModal"
        object="[[activityData]]"
        object-id="[[activityId]]"
        object-type="cluster.clusteractivity"
        modal-title="Add Cluster Activity Indicator">
      </indicator-modal>

      <list-view-indicators
          data="[[data]]"
          total-results="[[totalResults]]"
          type="ca"
          can-edit="[[canAddIndicator]]">
      </list-view-indicators>
    </page-body>
    `;
    }
    static get observers() {
        return [
            '_clusterActivityIndicatorsAjax(queryParams, activityId)',
        ];
    }
    _openModal() {
        this.$.indicatorModal.open();
    }
    _onSuccess() {
        this._clusterActivityIndicatorsAjax();
    }
    _computeCurrentIndicators(activityId, allIndicators) {
        if (!activityId || !allIndicators) {
            return;
        }
        return allIndicators[activityId];
    }
    _computeCurrentIndicatorsCount(activityId, allIndicatorsCount) {
        if (!activityId || !allIndicatorsCount) {
            return;
        }
        return allIndicatorsCount[activityId];
    }
    _computeUrl() {
        if (!this.activityId) {
            return;
        }
        // Make sure the queryParams are updated before the thunk is created:
        this.set('queryParams.object_id', this.activityId);
        return Endpoints.indicators('ca');
    }
    _clusterActivityIndicatorsAjax() {
        if (!this.activityId || !this.url || !this.queryParams) {
            return;
        }
        const thunk = this.$.indicators.thunk();
        this.$.indicators.abort();
        this.reduxStore.dispatch(clusterActivitiesIndicatorsFetch(thunk, String(this.activityId)))
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling.
        });
    }
    _computeCanAddIndicator(permissions, clusterId) {
        return permissions && permissions.createClusterEntities &&
            permissions.createClusterEntitiesForCluster(clusterId);
    }
    _addEventListeners() {
        this._onSuccess = this._onSuccess.bind(this);
        this.addEventListener('indicator-added', this._onSuccess);
        this.addEventListener('indicator-edited', this._onSuccess);
    }
    _removeEventListeners() {
        this.removeEventListener('indicator-added', this._onSuccess);
        this.removeEventListener('indicator-edited', this._onSuccess);
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
__decorate([
    property({ type: Object })
], Indicators.prototype, "permissions", void 0);
__decorate([
    property({ type: Object })
], Indicators.prototype, "queryParams", void 0);
__decorate([
    property({ type: Object })
], Indicators.prototype, "activityData", void 0);
__decorate([
    property({ type: Number })
], Indicators.prototype, "activityId", void 0);
__decorate([
    property({ type: Number })
], Indicators.prototype, "clusterId", void 0);
__decorate([
    property({ type: Array, computed: '_computeCurrentIndicators(activityId, allIndicators)' })
], Indicators.prototype, "data", void 0);
__decorate([
    property({ type: Number, computed: '_computeCurrentIndicatorsCount(activityId, allIndicatorsCount)' })
], Indicators.prototype, "totalResults", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(activityId, queryParams)' })
], Indicators.prototype, "url", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.clusterActivities.indicators)' })
], Indicators.prototype, "allIndicators", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.clusterActivities.indicatorsCount)' })
], Indicators.prototype, "allIndicatorsCount", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeCanAddIndicator(permissions, clusterId)' })
], Indicators.prototype, "canAddIndicator", void 0);
window.customElements.define('rp-clusters-activity-indicators', Indicators);
export { Indicators as RpClusterActivityIndicatorsEl };
