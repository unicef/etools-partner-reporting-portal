var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../../ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../etools-prp-permissions';
import '../../../page-body';
import UtilsMixin from '../../../../mixins/utils-mixin';
import LocalizeMixin from '../../../../mixins/localize-mixin';
import Endpoints from '../../../../endpoints';
import { tableStyles } from '../../../../styles/table-styles';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import '../../indicator-modal';
import '../../../list-view-indicators';
import '../../../etools-prp-ajax';
import { partnerProjIndicatorsFetch } from '../../../../redux/actions/partnerProjects';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class Indicators extends UtilsMixin(LocalizeMixin(ReduxConnectedElement)) {
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
        <template
            is="dom-if"
            if="[[permissions.createPartnerEntities]]"
            restamp="true">
          <div id="action">
            <paper-button id="add" on-tap="_openModal" class="btn-primary" raised>
              [[localize('add_project_indicator')]]
            </paper-button>
          </div>
        </template>

        <indicator-modal
          id="indicatorModal"
          object-id="[[projectId]]"
          object-type="partner.partnerproject"
          modal-title="Add Project Indicator">
        </indicator-modal>

        <list-view-indicators
            data="[[data]]"
            total-results="[[totalResults]]"
            can-edit="[[permissions.editIndicatorDetails]]">
        </list-view-indicators>
      </page-body>
    `;
    }
    static get observers() {
        return ['_indicatorsAjax(queryParams, projectId)'];
    }
    _openModal() {
        this.$.indicatorModal.open();
    }
    _onSuccess() {
        this._indicatorsAjax();
    }
    _computeCurrentIndicators(projectId, allIndicators) {
        if (!projectId || !allIndicators) {
            return;
        }
        return allIndicators[projectId];
    }
    _computeCurrentIndicatorsCount(projectId, allIndicatorsCount) {
        if (!projectId || !allIndicatorsCount) {
            return;
        }
        return allIndicatorsCount[projectId];
    }
    _computeUrl() {
        // Make sure the queryParams are updated before the thunk is created:
        if (!this.projectId) {
            return;
        }
        this.set('queryParams.object_id', this.projectId);
        return Endpoints.indicators('pp');
    }
    _indicatorsAjax() {
        if (!this.projectId || !this.url || !this.queryParams) {
            return;
        }
        let thunk = this.$.indicators.thunk();
        this.$.indicators.abort();
        this.reduxStore.dispatch(partnerProjIndicatorsFetch(thunk, String(this.projectId)))
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
], Indicators.prototype, "permissions", void 0);
__decorate([
    property({ type: String })
], Indicators.prototype, "query", void 0);
__decorate([
    property({ type: Object })
], Indicators.prototype, "queryParams", void 0);
__decorate([
    property({ type: Number })
], Indicators.prototype, "projectId", void 0);
__decorate([
    property({ type: Array, computed: '_computeCurrentIndicators(projectId, allIndicators)' })
], Indicators.prototype, "data", void 0);
__decorate([
    property({ type: Number, computed: '_computeCurrentIndicatorsCount(projectId, allIndicatorsCount)' })
], Indicators.prototype, "totalResults", void 0);
__decorate([
    property({ type: String, computed: '_computeUrl(projectId, queryParams)' })
], Indicators.prototype, "url", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partnerProjects.indicators)' })
], Indicators.prototype, "allIndicators", void 0);
__decorate([
    property({ type: Object, computed: 'getReduxStateObject(rootState.partnerProjects.indicatorsCount)' })
], Indicators.prototype, "allIndicatorsCount", void 0);
window.customElements.define('pa-project-details-indicators', Indicators);
export { Indicators as PaProjectDetailsIndicatorsEl };
