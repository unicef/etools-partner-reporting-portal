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
import {translate} from 'lit-translate';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState} from '../../typings/redux.types';

@customElement('report-filters')
export class ReportFilters extends UtilsMixin(connect(store)(LitElement)) {
  @property({type: Object})
  queryParams: any = {};

  @property({type: Object})
  filters: any[] = [];

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

      <filter-list .filters="${this.filters}" @filters-changed=${(e) => (this.filters = e.detail.value)}>
        <div class="app-grid">
          <reportable-filter
            class="item"
            .value="${this._withDefault(this.queryParams?.llo, '-1')}"
          ></reportable-filter>
          <report-location-filter
            class="item"
            .value="${this._withDefault(this.queryParams?.location, '-1')}"
          ></report-location-filter>
          <checkbox-filter
            class="incomplete"
            name="incomplete"
            .value="${this._withDefault(this.queryParams?.incomplete, '')}"
          >
            <span class="checkbox-label">${translate('SHOW_INCOMPLETE_ONLY')}</span>
          </checkbox-filter>
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
}
