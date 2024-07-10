import {LitElement, html, css} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from 'pwa-helpers';
import {store} from '../../redux/store';
import '../../etools-prp-common/elements/filter-list';
import '../filters/text-filter/text-filter';
import '../filters/dropdown-filter/dropdown-filter-multi';
import '../filters/location-filter/location-filter';
import '../filters/pd-filter/pd-dropdown-filter';
import '../filters/checkbox-filter/checkbox-filter';
import {filterStyles} from '../../styles/filter-styles';
import LocalizeMixin from '../../etools-prp-common/mixins/localize-mixin';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

@customElement('indicators-filters')
export class IndicatorsFilters extends LocalizeMixin(UtilsMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
      background: white;
      --app-grid-columns: 4;
      --app-grid-item-height: auto;
      --app-grid-expandible-item-columns: 2;
    }
    .item-2-col {
      @apply --app-grid-expandible-item;
    }
    checkbox-filter {
      margin-top: 2em;
    }
  `;

  @property({type: Object})
  queryParams!: any;

  @property({type: Array})
  pd_statuses: any[] = this._initStatuses();

  render() {
    return html`
      ${filterStyles}

      <filter-list .filters="${this.filters}">
        <div class="app-grid">
          <dropdown-filter-multi
            class="item item-2-col"
            label="${this.localize('pd_status')}"
            name="pd_statuses"
            .value="${this._withDefault(this.queryParams?.pd_statuses, '')}"
            .data="${this.pd_statuses}"
            hide-search
          >
          </dropdown-filter-multi>

          <pd-dropdown-filter class="item item-2-col" .value="${this._withDefault(this.queryParams?.pds, '')}">
          </pd-dropdown-filter>

          <location-filter class="item" .value="${this._withDefault(this.queryParams?.location, '-1')}">
          </location-filter>

          <text-filter
            class="item"
            label="${this.localize('indicator_title')}"
            name="blueprint__title"
            .value="${this.queryParams?.blueprint__title || ''}"
          >
          </text-filter>
        </div>
      </filter-list>
    `;
  }

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.routeDetails, state.app.routeDetails.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
  }

  private _initStatuses(): {title: string; id: string}[] {
    return [
      {title: this.localize('signed'), id: 'signed'},
      {title: this.localize('active'), id: 'active'},
      {title: this.localize('suspended'), id: 'suspended'},
      {title: this.localize('ended'), id: 'ended'},
      {title: this.localize('closed'), id: 'closed'},
      {title: this.localize('terminated'), id: 'terminated'}
    ];
  }
}
