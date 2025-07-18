import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import '../../etools-prp-common/elements/filter-list';
import '../filters/text-filter/text-filter';
import '../filters/dropdown-filter/dropdown-filter-multi';
import '../filters/location-filter/location-filter';
import '../filters/pd-filter/pd-dropdown-filter';
import '../filters/checkbox-filter/checkbox-filter';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {filterStyles} from '../../styles/filter-styles';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {RootState} from '../../typings/redux.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {valueWithDefault} from '@unicef-polymer/etools-utils/dist/general.util';
import {valueWithDefaultStatuses} from '../../etools-prp-common/utils/util';

@customElement('indicators-filters')
export class IndicatorsFilters extends connect(store)(LitElement) {
  @property({type: Object})
  queryParams!: any;

  @property({type: Boolean})
  isGpd = false;

  @property({type: Array})
  pd_statuses: any[] = [];

  @property({type: Array})
  filters: any[] = [];

  constructor() {
    super();
    this.pd_statuses = this._initStatuses();
  }

  render() {
    return html`
      ${filterStyles}

      <style>
        ${layoutStyles} :host {
          display: block;
          background: white;
        }
        checkbox-filter {
          margin-top: 2em;
        }
      </style>

      <filter-list .filters="${this.filters}">
        <div class="row">
          <dropdown-filter-multi
            class="col-md-6 col-12"
            label="${translate(this.isGpd ? 'GPD_STATUS' : 'PD_STATUS')}"
            name="pd_statuses"
            .value="${valueWithDefaultStatuses(this.queryParams?.pd_statuses, '')}"
            .data="${this.pd_statuses}"
            hide-search
          >
          </dropdown-filter-multi>

          <pd-dropdown-filter
            class="col-md-6 col-12"
            ?isGpd="${this.isGpd}"
            .value="${valueWithDefault(this.queryParams?.pds, '')}"
          >
          </pd-dropdown-filter>

          <location-filter class="col-md-3 col-12" .value="${valueWithDefault(this.queryParams?.location, '-1')}">
          </location-filter>

          <text-filter
            class="col-md-3 col-12"
            label="${translate('INDICATOR_TITLE')}"
            name="blueprint__title"
            .value="${this.queryParams?.blueprint__title || ''}"
          >
          </text-filter>
        </div>
      </filter-list>
    `;
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);
  }

  private _initStatuses(): {title: string; id: string}[] {
    return [
      {title: getTranslation('SIGNED'), id: 'signed'},
      {title: getTranslation('ACTIVE'), id: 'active'},
      {title: getTranslation('SUSPENDED'), id: 'suspended'},
      {title: getTranslation('ENDED'), id: 'ended'},
      {title: getTranslation('CLOSED'), id: 'closed'},
      {title: getTranslation('TERMINATED'), id: 'terminated'}
    ];
  }
}
