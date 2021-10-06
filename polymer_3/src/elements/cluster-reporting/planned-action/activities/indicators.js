var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../mixins/utils-mixin';
import Endpoints from '../../../../endpoints';
import { partnerActivitiesIndicatorsFetch } from '../../../../redux/actions/partnerActivities';
import '../../../etools-prp-permissions';
import '../../../page-body';
import '../../../list-view-indicators';
import '../../indicator-modal';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import { tableStyles } from '../../../../styles/table-styles';
/**
* @polymer
* @appliesMixin LocalizeMixin
* @appliesMixin UtilsBehavior
*/
class PaActivityDetailsIndicators extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
    static get template() {
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

      <template is="dom-if" if="[[isCustom]]">
        <div id="action">
          <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
            [[localize('add_activity_indicator')]]
          </paper-button>
        </div>
      </template>

      <indicator-modal
        id="indicatorModal"
        object-id="[[activityId]]"
        activity-data="[[activityData]]"
        object-type="partner.partneractivity"
        modal-title="Add Activity Indicator">
      </indicator-modal>

      <list-view-indicators
          data="[[data]]"
          type="pa"
          total-results="[[totalResults]]"
          is-custom="[[isCustom]]"
          can-edit="[[permissions.editIndicatorDetails]]">
      </list-view-indicators>
    </page-body>
  `;
    }
    static get observers() {
        return [
            '_indicatorsAjax(queryParams, activityId)',
        ];
    }
    _openModal() {
        this.$.indicatorModal.open();
    }
    _onSuccess() {
        this._indicatorsAjax();
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
        //Make sure the queryParams are updated before the thunk is created:
        this.set('queryParams.object_id', this.activityId);
        return Endpoints.indicators('pa');
    }
    _indicatorsAjax() {
        if (!this.activityId || !this.url || !this.queryParams) {
            return;
        }
        const thunk = this.$.indicators.thunk();
        this.$.indicators.abort();
        this.reduxStore.dispatch(partnerActivitiesIndicatorsFetch(thunk, String(this.activityId)))
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling.
        });
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
], PaActivityDetailsIndicators.prototype, "queryParams", void 0);
__decorate([
    property({ type: Object })
], PaActivityDetailsIndicators.prototype, "activityData", void 0);
__decorate([
    property({ type: Number })
], PaActivityDetailsIndicators.prototype, "activityId", void 0);
__decorate([
    property({ type: Array, computed: '_computeCurrentIndicators(activityId, allIndicators)' })
], PaActivityDetailsIndicators.prototype, "data", void 0);
__decorate([
    property({ type: Number, computed: '_computeCurrentIndicatorsCount(activityId, allIndicatorsCount)' })
], PaActivityDetailsIndicators.prototype, "totalResults", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(activityId, queryParams)' })
], PaActivityDetailsIndicators.prototype, "url", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partnerActivities.indicators)' })
], PaActivityDetailsIndicators.prototype, "allIndicators", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partnerActivities.indicatorsCount)' })
], PaActivityDetailsIndicators.prototype, "allIndicatorsCount", void 0);
window.customElements.define('pa-activity-details-indicators', PaActivityDetailsIndicators);
export { PaActivityDetailsIndicators as PaActivityDetailsIndicatorsEl };
