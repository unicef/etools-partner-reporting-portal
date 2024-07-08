import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {filterStyles} from '../../styles/filter-styles';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '../../etools-prp-common/elements/filter-list.js';
import '../../elements/filters/text-filter/text-filter.js';
import '../../elements/filters/dropdown-filter/dropdown-filter-multi.js';
import '../../elements/filters/location-filter-multi/location-filter-multi.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('pd-filters')
export class PdFilters extends UtilsMixin(LocalizeMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
      background: white;

      --app-grid-columns: 5;
      --app-grid-item-height: auto;
      --app-grid-expandible-item-columns: 2;
    }

    .filter-2-col {
      @apply --app-grid-expandible-item;
    }
  `;

  @property({type: Object})
  queryParams!: any;

  @property({type: Array})
  statuses: any[] = this._initStatuses();

  @property({type: Object})
  filters: any[] = [];

  render() {
    return html`
      ${filterStyles}
      <filter-list .filters="${this.filters}" @filters-changed=${(e) => (this.filters = e.detail.value)}>
        <div class="app-grid">
          <text-filter
            class="item"
            label="${this.localize('pd_ref_and_title')}"
            name="ref_title"
            .value="${this.queryParams?.ref_title || ''}"
            @value-changed="${this._handleFilterChange}"
          >
          </text-filter>
          <dropdown-filter-multi
            class="item filter-2-col"
            label="${this.localize('pd_ssfa_status')}"
            name="status"
            .value="${this._withDefault(this.queryParams?.status, '')}"
            .data="${this.statuses}"
            hide-search
            @value-changed="${this._handleFilterChange}"
          >
          </dropdown-filter-multi>
          <location-filter-multi
            class="item filter-2-col"
            .value="${this._withDefault(this.queryParams?.location, '')}"
            @value-changed="${this._handleFilterChange}"
          >
          </location-filter-multi>
        </div>
      </filter-list>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('resources')) {
      this.statuses = this._initStatuses();
    }
  }

  stateChanged(state: RootState) {
    if (state.app.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }

  private _initStatuses() {
    return [
      {title: this.localize('signed'), id: 'signed'},
      {title: this.localize('active'), id: 'active'},
      {title: this.localize('suspended'), id: 'suspended'},
      {title: this.localize('ended'), id: 'ended'},
      {title: this.localize('closed'), id: 'closed'},
      {title: this.localize('terminated'), id: 'terminated'}
    ];
  }

  private _handleFilterChange(event: CustomEvent) {
    const {name, value} = event.detail;
    this.queryParams = {...this.queryParams, [name]: value};
    fireEvent(this, 'filters-changed', this.queryParams);
  }
}

export {PdFilters as PdFiltersEl};
