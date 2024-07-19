import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import {filterStyles} from '../../styles/filter-styles';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from 'lit-translate';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '../../etools-prp-common/elements/filter-list.js';
import '../../elements/filters/text-filter/text-filter.js';
import '../../elements/filters/dropdown-filter/dropdown-filter-multi.js';
import '../../elements/filters/location-filter-multi/location-filter-multi.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('pd-filters')
export class PdFilters extends UtilsMixin(connect(store)(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

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
        <div class="row">
          <text-filter
            class="col-lg-2 col-12"
            label="${translate('PD_REF_AND_TITLE')}"
            name="ref_title"
            .value="${this.queryParams?.ref_title || ''}"
            @value-changed="${this._handleFilterChange}"
          >
          </text-filter>
          <dropdown-filter-multi
            class="col-lg-5 col-12"
            label="${translate('PD_SSFA_STATUS')}"
            name="status"
            .value="${this._withDefault(this.queryParams?.status, '')}"
            .data="${this.statuses}"
            hide-search
            @value-changed="${this._handleFilterChange}"
          >
          </dropdown-filter-multi>
          <location-filter-multi
            class="col-lg-5 col-12"
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
      {title: translate('SIGNED'), id: 'signed'},
      {title: translate('ACTIVE'), id: 'active'},
      {title: translate('SUSPENDED'), id: 'suspended'},
      {title: translate('ENDED'), id: 'ended'},
      {title: translate('CLOSED'), id: 'closed'},
      {title: translate('TERMINATED'), id: 'terminated'}
    ];
  }

  private _handleFilterChange(event: CustomEvent) {
    const {name, value} = event.detail;
    this.queryParams = {...this.queryParams, [name]: value};
    fireEvent(this, 'filters-changed', this.queryParams);
  }
}

export {PdFilters as PdFiltersEl};
