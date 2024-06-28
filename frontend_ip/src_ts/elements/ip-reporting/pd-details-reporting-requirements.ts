import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import {tableStyles} from '../../etools-prp-common/styles/table-styles';
import {getReportName} from './js/pd-details-reporting-requirements-functions';
import '@unicef-polymer/etools-loading/etools-loading';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '../../etools-prp-common/elements/list-placeholder';

@customElement('pd-details-reporting-requirements')
export class PdDetailsReportingRequirements extends UtilsMixin(LocalizeMixin(connect(store)(LitElement))) {
  static styles = css`
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
  `;

  @property({type: Array})
  data: any[] = [];

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  title = '';

  render() {
    return html`
      ${tableStyles}

      <section>
        <h3>${this.title}</h3>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column field=""> ${this.localize('report_number')} </etools-data-table-column>
          <etools-data-table-column field=""> ${this.localize('due_date')} </etools-data-table-column>
          <etools-data-table-column field=""> ${this.localize('reporting_period')} </etools-data-table-column>
        </etools-data-table-header>

        ${this.data.map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <div class="table-cell">${getReportName(item.report_type, index, this.localize)}</div>
                <div class="table-cell table-cell--text">${item.due_date}</div>
                <div class="table-cell table-cell--text">${item.start_date} - ${item.end_date}</div>
              </div>
            </etools-data-table-row>
          `
        )}

        <list-placeholder
          .data="${this.data}"
          .loading="${this.loading}"
          message="${this.localize('no_report_data')}"
        ></list-placeholder>
      </section>
    `;
  }
}
