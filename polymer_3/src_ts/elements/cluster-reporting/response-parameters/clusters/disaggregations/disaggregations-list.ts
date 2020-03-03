import {html} from '@polymer/polymer';
import { ReduxConnectedElement } from '../../../../../ReduxConnectedElement';
import {property} from '@polymer/decorators/lib/decorators';
import LocalizeMixin from '../../../../../mixins/localize-mixin';
import UtilsMixin from '../../../../../mixins/utils-mixin';
import DataTableMixin from '../../../../../mixins/data-table-mixin';
import PaginationMixin from '../../../../../mixins/pagination-mixin';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../../etools-prp-ajax';
import '../../../../page-body';
import {tableStyles} from '../../../../../styles/table-styles';
import { GenericObject } from '../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin ModalMixin
 * @appliesMixin UtilsMixin
 * @appliesMixin DataTableMixin
 * @appliesMixin PaginationMixin
 */
class DisaggregationList extends LocalizeMixin(UtilsMixin(DataTableMixin(PaginationMixin(ReduxConnectedElement)))) {
  public static get template() {
    // language=HTML
    return html`
    ${tableStyles}
    <style include="data-table-styles iron-flex">
      :host {
        display: block;
      }

      div#action {
        margin-bottom: 25px;
        @apply --layout-horizontal;
        @apply --layout-end-justified;
      }

      a {
        color: var(--theme-primary-color);
      }

      .wrapper {
        position: relative;
      }
    </style>

      <iron-location
          query="{{query}}">
      </iron-location>

      <iron-query-params
          params-string="{{query}}"
          params-object="{{queryParams}}">
      </iron-query-params>

    <div class="wrapper">
      <etools-data-table-header
          no-collapse
          label="[[visibleRange.0]]-[[visibleRange.1]] of [[totalResults]] [[localize('results_to_show')]]">
        <etools-data-table-column field="disaggregation">
          <div class="table-column">[[localize('disaggregation')]]</div>
        </etools-data-table-column>
        <etools-data-table-column field="groups">
          <div class="table-column">[[localize('disaggregation_groups')]]</div>
        </etools-data-table-column>
      </etools-data-table-header>

      <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <template
          id="list"
          is="dom-repeat"
          items="[[disaggregations]]"
          as="disaggregation"
          initial-count="[[pageSize]]">
        <etools-data-table-row no-collapse>
          <div slot="row-data">
            <div class="table-cell table-cell--text">
              [[disaggregation.name]]
            </div>
            <div class="table-cell table-cell--text">
                [[_formatChoices(disaggregation)]]
            </div>
          </div>
        </etools-data-table-row>
      </template>

      <etools-data-table-footer
          page-size="[[pageSize]]"
          page-number="[[pageNumber]]"
          total-results="[[totalResults]]"
          visible-range="{{visibleRange}}"
          on-page-size-changed="_pageSizeChanged"
          on-page-number-changed="_pageNumberChanged">
      </etools-data-table-footer>

      <etools-loading active="[[loading]]"></etools-loading>
    </div>
    `;
  }

  @property({type: Boolean, computed: 'getReduxStateValue(rootState.clusterDisaggregations.loading)'})
  loading!: boolean;

  @property({type: Object, computed: 'getReduxStateObject(rootState.clusterDisaggregations.all)'})
  allPartners!: GenericObject;

  @property({type: Number, computed: 'getReduxStateValue(rootState.clusterActivities.partners)'})
  totalResults!: number;

  _formatChoices(data: GenericObject) {
    return data.choices.map(function(choice: GenericObject) {
      return choice.value;
    }).join(', ');
  }
}

window.customElements.define('clusters-disaggregations-list', DisaggregationList);

export {DisaggregationList as DisaggregationListEl};
