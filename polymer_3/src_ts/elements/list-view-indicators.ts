import {ReduxConnectedElement} from '../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-loading/etools-loading';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import DataTableMixin from '../mixins/data-table-mixin';
import UtilsMixin from '../mixins/utils-mixin';
import LocalizeMixin from '../mixins/localize-mixin';
import PaginationMixin from '../mixins/pagination-mixin';

import './list-view-single-indicator';
import './list-placeholder';
import './message-box';
import './etools-prp-permissions';
import {GenericObject} from '../typings/globals.types';
import {tableStyles} from '../styles/table-styles';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 * @appliesMixin LocalizeMixin
 */
class ListViewIndicators extends (UtilsMixin(DataTableMixin(PaginationMixin(LocalizeMixin(ReduxConnectedElement))))) {

  public static get template() {
    return html`
        ${tableStyles}
      <style include="iron-flex iron-flex-factors data-table-styles">
        :host {
          --ecp-content: {
            padding: 1px 0 0;
          };
        }

        message-box {
          margin: 25px 25px 0;
        }
      </style>

      <iron-location
          query="{{query}}">
      </iron-location>

      <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
      </iron-query-params>

      <etools-prp-permissions
          permissions="{{permissions}}">
      </etools-prp-permissions>

      <etools-content-panel panel-title="[[localize('list_of_indicators')]]">
      <template
          is="dom-if"
          if="[[showLocationsWarning]]"
          restamp="[[true]]">
        <message-box type="warning">
          [[localize('please_make_sure_indicators')]]
        </message-box>
      </template>

      <etools-data-table-header
          id="listHeader"
          label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">

          <etools-data-table-column field="indicator">
            <div class="table-column">[[localize('indicator')]]</div>
          </etools-data-table-column>

          <template
            is="dom-if"
            if="[[showProjectContextColumn]]"
            restamp="[[true]]">
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

          <template
            is="dom-if"
            if="[[haveReports]]"
            restamp="true">
            <etools-data-table-column field="">
              <div class="table-column">&nbsp;</div>
            </etools-data-table-column>
          </template>

          <template
              is="dom-if"
              if="[[canEdit]]"
              restamp="true">
            <etools-data-table-column field="">
              <div class="table-column">&nbsp;</div>
            </etools-data-table-column>
          </template>

          <template
              is="dom-if"
              if="[[canEditLocations]]"
              restamp="true">
            <etools-data-table-column field="">
              <div class="table-column">&nbsp;</div>
            </etools-data-table-column>
          </template>
        </etools-data-table-header>

        <etools-data-table-footer
            page-size="[[pageSize]]"
            page-number="[[pageNumber]]"
            total-results="[[totalResults]]"
            visible-range="{{visibleRange}}"
            on-page-size-changed="_pageSizeChanged"
            on-page-number-changed="_pageNumberChanged">
        </etools-data-table-footer>

        <template id="list"
                  is="dom-repeat"
                  items="[[data]]"
                  initial-count="[[pageSize]]"
                  as="indicator">
          <list-view-single-indicator
              indicator="{{indicator}}"
              is-custom="[[isCustom]]"
              can-edit="[[canEdit]]"
              type="[[type]]">
          </list-view-single-indicator>
        </template>

        <list-placeholder data="[[data]]"></list-placeholder>

        <etools-data-table-footer
            page-size="[[pageSize]]"
            page-number="[[pageNumber]]"
            total-results="[[totalResults]]"
            visible-range="{{visibleRange}}"
            on-page-size-changed="_pageSizeChanged"
            on-page-number-changed="_pageNumberChanged">
        </etools-data-table-footer>

      </etools-content-panel>
    `;
  }

  @property({type: Array})
  data!: any[];

  @property({type: Boolean})
  loading!: boolean;

  @property({type: Boolean})
  isCustom!: boolean;

  @property({type: Boolean})
  canEdit!: boolean;

  @property({type: Number})
  totalResults!: number;

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  query!: string;

  @property({type: Number})
  pageSize!: number;

  @property({type: Number})
  pageNumber!: number;

  @property({type: Object})
  permissions!: GenericObject;

  @property({type: String})
  type!: string;

  @property({type: Array})
  openedDetails = [];

  @property({type: Boolean, computed: '_computeIsClusterApp(appName)'})
  isClusterApp!: boolean;

  @property({type: Boolean, computed: '_computeHaveReports(isClusterApp, type)'})
  haveReports!: boolean;

  @property({type: String, computed: 'getReduxStateValue(rootState.app.current)'})
  appName!: string;

  @property({type: Boolean, computed: '_computeCanEditLocations(isClusterApp, type, permissions)'})
  canEditLocations!: boolean;

  @property({type: Boolean, computed: '_computeShowProjectContextColumn(type)'})
  showProjectContextColumn!: boolean;


  @property({type: Boolean, computed: '_computeShowLocationsWarning(isClusterApp, type, canEdit, data)'})
  showLocationsWarning!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this._addEventListeners();
  }

  _addEventListeners() {
    this.addEventListener('details-opened-changed', this._detailsChange as any);
  }

  _removeEventListeners() {
    this.removeEventListener('details-opened-changed', this._detailsChange as any);
  }

  _computeCanEditLocations(isClusterApp: boolean, type: string, permissions: GenericObject) {
    return isClusterApp && type === 'ca' && permissions.editIndicatorLocations;
  }

  _computeIsClusterApp(appName: string) {
    return appName === 'cluster-reporting';
  }

  _computeShowLocationsWarning(isClusterApp: boolean, type: string, canEdit: boolean, data: GenericObject) {
    if (!data) {
      return;
    }
    let baseConditionsMet = isClusterApp && type !== 'ca' && canEdit;

    return baseConditionsMet && data.some((indicator: GenericObject) => {
      return !indicator.locations.length;
    });
  }

  _computeShowProjectContextColumn(type: string) {
    return type === 'pa';
  }

  _computeHaveReports(isClusterApp: boolean, type: string) {
    return isClusterApp && type !== 'ca';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEventListeners();
    this.openedDetails.length = 0;
  }

}

window.customElements.define('list-view-indicators', ListViewIndicators);
