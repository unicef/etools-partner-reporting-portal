import {ReduxConnectedElement} from '../../etools-prp-common/ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '../../etools-prp-common/elements/list-placeholder';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import {getReportName} from './js/pd-details-reporting-requirements-functions';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin UtilsMixin
 * @appliesMixin LocalizeMixin
 */
class PdDetailsReportingRequirements extends LocalizeMixin(UtilsMixin(ReduxConnectedElement)) {
  static get template() {
    return html`
      ${tableStyles}
      <style include="data-table-styles">
        :host {
          display: block;

          --header-title: {
            display: none;
          }

          --data-table-header: {
            height: auto;
          }
        }

        h3 {
          padding: 0 24px;
          margin: 0;
        }
      </style>

      <section>
        <h3>[[title]]</h3>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column field=""> [[localize('report_number')]] </etools-data-table-column>
          <etools-data-table-column field=""> [[localize('due_date')]] </etools-data-table-column>
          <etools-data-table-column field=""> [[localize('reporting_period')]] </etools-data-table-column>
        </etools-data-table-header>

        <template is="dom-repeat" items="[[data]]">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <div class="table-cell">[[_getReportName(item.report_type, index, localize)]]</div>
              <div class="table-cell table-cell--text">[[item.due_date]]</div>
              <div class="table-cell table-cell--text">[[item.start_date]] - [[item.end_date]]</div>
            </div>
          </etools-data-table-row>
        </template>

        <list-placeholder data="[[data]]" loading="[[loading]]" message="[[localize('no_report_data')]]">
        </list-placeholder>
      </section>
    `;
  }

  @property({type: Array})
  data!: any[];

  @property({type: Boolean})
  loading!: boolean;

  @property({type: String})
  title!: string;

  _getReportName(type: any, index: any, localize: any) {
    return getReportName(type, index, localize);
  }
}

window.customElements.define('pd-details-reporting-requirements', PdDetailsReportingRequirements);
