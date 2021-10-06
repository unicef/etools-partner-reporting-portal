var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators/lib/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import DataTableMixin from '../etools-prp-common/mixins/data-table-mixin';
import UtilsMixin from '../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../etools-prp-common/mixins/localize-mixin';
import PaginationMixin from '../etools-prp-common/mixins/pagination-mixin';
import './list-view-single-indicator';
import '../etools-prp-common/elements/list-placeholder';
import '../etools-prp-common/elements/message-box';
import '../etools-prp-common/elements/etools-prp-permissions';
import { tableStyles } from '../etools-prp-common/styles/table-styles';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin LocalizeMixin
 */
class ListViewIndicators extends UtilsMixin(DataTableMixin(PaginationMixin(LocalizeMixin(ReduxConnectedElement)))) {
    constructor() {
        super(...arguments);
        this.openedDetails = [];
    }
    static get template() {
        return html `
      ${tableStyles}
      <style include="iron-flex iron-flex-factors data-table-styles">
        etools-content-panel::part(ecp-content) {
          padding: 1px 0 0;
        }
        message-box {
          margin: 25px 25px 0;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-permissions permissions="{{permissions}}"> </etools-prp-permissions>

      <etools-content-panel panel-title="[[localize('list_of_indicators')]]">
        <etools-data-table-header
          id="listHeader"
          label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]"
        >
          <etools-data-table-column field="indicator">
            <div class="table-column">[[localize('indicator')]]</div>
          </etools-data-table-column>

          <template is="dom-if" if="[[showProjectContextColumn]]" restamp="[[true]]">
            <etools-data-table-column field="content_object_title">
              <div class="table-column">[[localize('project_context')]]</div>
            </etools-data-table-column>
          </template>

          <etools-data-table-column field="blueprint.calculation_formula_across_locations">
            <div class="table-column">[[localize('calc_across_locations')]]</div>
          </etools-data-table-column>

          <etools-data-table-column field="blueprint.calculation_formula_across_periods">
            <div class="table-column">[[localize('calc_across_periods')]]</div>
          </etools-data-table-column>

          <etools-data-table-column field="indicator">
            <div class="table-column">[[localize('baseline')]]</div>
          </etools-data-table-column>

          <etools-data-table-column field="indicator">
            <div class="table-column">[[localize('target')]]</div>
          </etools-data-table-column>

          <etools-data-table-column field="indicator">
            <div class="table-column">[[localize('achieved')]]</div>
          </etools-data-table-column>

          <etools-data-table-column field="progress_percentage" sortable flex-2>
            <div class="table-column">[[localize('current_progress')]]</div>
          </etools-data-table-column>
        </etools-data-table-header>

        <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged"
        >
        </etools-data-table-footer>

        <template id="list" is="dom-repeat" items="[[data]]" initial-count="[[pageSize]]" as="indicator">
          <list-view-single-indicator
            indicator="{{indicator}}"
            is-custom="[[isCustom]]"
            can-edit="[[canEdit]]"
            type="[[type]]"
          >
          </list-view-single-indicator>
        </template>

        <list-placeholder data="[[data]]"></list-placeholder>

        <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged"
        >
        </etools-data-table-footer>
      </etools-content-panel>
    `;
    }
    connectedCallback() {
        super.connectedCallback();
        this._addEventListeners();
    }
    _addEventListeners() {
        this.addEventListener('details-opened-changed', this._detailsChange);
    }
    _removeEventListeners() {
        this.removeEventListener('details-opened-changed', this._detailsChange);
    }
    _computeShowProjectContextColumn(type) {
        return type === 'pa';
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this._removeEventListeners();
        this.openedDetails.length = 0;
    }
}
__decorate([
    property({ type: Array })
], ListViewIndicators.prototype, "data", void 0);
__decorate([
    property({ type: Boolean })
], ListViewIndicators.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], ListViewIndicators.prototype, "isCustom", void 0);
__decorate([
    property({ type: Boolean })
], ListViewIndicators.prototype, "canEdit", void 0);
__decorate([
    property({ type: Number })
], ListViewIndicators.prototype, "totalResults", void 0);
__decorate([
    property({ type: Object })
], ListViewIndicators.prototype, "queryParams", void 0);
__decorate([
    property({ type: String })
], ListViewIndicators.prototype, "query", void 0);
__decorate([
    property({ type: Number })
], ListViewIndicators.prototype, "pageSize", void 0);
__decorate([
    property({ type: Number })
], ListViewIndicators.prototype, "pageNumber", void 0);
__decorate([
    property({ type: Object })
], ListViewIndicators.prototype, "permissions", void 0);
__decorate([
    property({ type: String })
], ListViewIndicators.prototype, "type", void 0);
__decorate([
    property({ type: Array })
], ListViewIndicators.prototype, "openedDetails", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.app.current)' })
], ListViewIndicators.prototype, "appName", void 0);
__decorate([
    property({ type: Boolean, computed: '_computeShowProjectContextColumn(type)' })
], ListViewIndicators.prototype, "showProjectContextColumn", void 0);
window.customElements.define('list-view-indicators', ListViewIndicators);
