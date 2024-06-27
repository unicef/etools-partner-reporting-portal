import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '@polymer/paper-button/paper-button.js';
import {filterStyles} from '../../styles/filter-styles';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/dropdown-filter/dropdown-filter';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {store} from '../../redux/store';
import {connect} from 'pwa-helpers';

@customElement('pd-report-filters')
export class PdReportFilters extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = [
    css`
      :host {
        display: block;
        background: white;
        --app-grid-columns: 3;
        --app-grid-item-height: auto;
      }
    `
  ];

  @property({type: String})
  query!: string;

  @property({type: Object})
  queryParams: any = {};

  @property({type: Object, attribute: false})
  filters: any = {};

  @property({type: Array})
  statuses: any[] = [];

  _localizeStatuses() {
    return [
      {title: this.localize('overdue'), id: 'Ove'},
      {title: this.localize('sent_back'), id: 'Sen'},
      {title: this.localize('due'), id: 'Due'},
      {title: this.localize('all'), id: '-1'},
      {title: this.localize('submitted'), id: 'Sub'},
      {title: this.localize('accepted'), id: 'Acc'},
      {title: this.localize('not_yet_due'), id: 'Not'}
    ];
  }

  render() {
    return html`
      ${filterStyles}
      <iron-location .query=${this.query}></iron-location>
      <iron-query-params .paramsString=${this.query} .paramsObject=${this.queryParams}></iron-query-params>

      <filter-list .filters=${this.filters}>
        <div class="app-grid">
          <dropdown-filter
            class="item"
            .label=${this.localize('status')}
            name="status"
            .value=${this._withDefault(this.queryParams?.status, '-1')}
            .data=${this.statuses}
          ></dropdown-filter>
        </div>
      </filter-list>
    `;
  }

  updated(changedProperties) {
    if (changedProperties.has('resources')) {
      this.statuses = this._localizeStatuses();
    }
  }
}

export {PdReportFilters as PdReportFiltersEl};
