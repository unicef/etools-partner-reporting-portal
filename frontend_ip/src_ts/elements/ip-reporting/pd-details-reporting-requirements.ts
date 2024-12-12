import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '../../etools-prp-common/elements/list-placeholder';

@customElement('pd-details-reporting-requirements')
export class PdDetailsReportingRequirements extends UtilsMixin(connect(store)(LitElement)) {
  static styles = [
    layoutStyles,
    css`
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
    `
  ];

  @property({type: Array})
  data: any[] = [];

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  title = '';

  render() {
    return html`
      ${tableStyles}
      <style>
        ${dataTableStylesLit}
      </style>
      <section>
        <h3>${this.title}</h3>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-4" field=""> ${translate('REPORT_NUMBER')} </etools-data-table-column>
          <etools-data-table-column class="col-4" field=""> ${translate('DUE_DATE')} </etools-data-table-column>
          <etools-data-table-column class="col-4" field=""> ${translate('REPORTING_PERIOD')} </etools-data-table-column>
        </etools-data-table-header>

        ${(this.data || []).map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="col-data col-4 table-cell">${this.getReportName(item.report_type, index)}</div>
                <div class="col-data col-4 table-cell table-cell--text">${item.due_date}</div>
                <div class="col-data col-4 table-cell table-cell--text">${item.start_date} - ${item.end_date}</div>
              </div>
            </etools-data-table-row>
          `
        )}

        <list-placeholder
          .data="${this.data}"
          .loading="${this.loading}"
          message="${translate('NO_REPORT_DATA')}"
        ></list-placeholder>
      </section>
    `;
  }
}
