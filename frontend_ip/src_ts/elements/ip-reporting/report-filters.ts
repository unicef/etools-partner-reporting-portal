import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {filterStyles} from '../../styles/filter-styles';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/reportable-filter/reportable-filter';
import '../../elements/filters/checkbox-filter/checkbox-filter';
import '../../elements/filters/report-location-filter/report-location-filter';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';

@customElement('report-filters')
export class ReportFilters extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  @property({type: Object})
  queryParams: any = {};

  @property({type: Object})
  filters: any = {};

  static styles = [
    css`
      :host {
        display: block;
        background: white;

        --app-grid-columns: 4;
        --app-grid-item-height: auto;
        --app-grid-expandible-item-columns: 4;
      }

      .incomplete {
        grid-column: span var(--app-grid-expandible-item-columns);
      }
    `
  ];

  render() {
    return html`
      ${filterStyles}
      <iron-location @query-changed="${this._onQueryChanged}"> </iron-location>
      <iron-query-params .paramsString="${this.query}" @params-object-changed="${this._onParamsObjectChanged}">
      </iron-query-params>

      <filter-list .filters="${this.filters}">
        <div class="app-grid">
          <reportable-filter class="item" .value="${this._withDefault(this.queryParams.llo, '-1')}"></reportable-filter>
          <report-location-filter
            class="item"
            .value="${this._withDefault(this.queryParams.location, '-1')}"
          ></report-location-filter>
          <checkbox-filter
            class="incomplete"
            name="incomplete"
            .value="${this._withDefault(this.queryParams.incomplete, '')}"
          >
            <span class="checkbox-label">${this.localize('show_incomplete_only')}</span>
          </checkbox-filter>
        </div>
      </filter-list>
    `;
  }

  _onQueryChanged(e: CustomEvent) {
    this.query = e.detail.value;
  }

  _onParamsObjectChanged(e: CustomEvent) {
    this.queryParams = e.detail.value;
  }
}
