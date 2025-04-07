import {html, css, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {store} from '../../redux/store';
import {filterStyles} from '../../styles/filter-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '../../etools-prp-common/elements/filter-list';
import '../../elements/filters/reportable-filter/reportable-filter';
import '../../elements/filters/checkbox-filter/checkbox-filter';
import '../../elements/filters/report-location-filter/report-location-filter';
import UtilsMixin from '../../etools-prp-common/mixins/utils-mixin';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState} from '../../typings/redux.types';

@customElement('report-filters')
export class ReportFilters extends UtilsMixin(connect(store)(LitElement)) {
  @property({type: Object})
  queryParams: any = {};

  @property({type: Object})
  filters: any[] = [];

  static styles = [
    layoutStyles,
    css`
      :host {
        display: block;
        background: white;
      }
    `
  ];

  render() {
    return html`
      ${filterStyles}

      <filter-list .filters="${this.filters}" @filters-changed=${(e) => (this.filters = e.detail.value)}>
        <div class="row">
          <div class="col-md-4 col-12">
            <reportable-filter
              class="item"
              .value="${this._withDefault(this.queryParams?.llo, '-1')}"
            ></reportable-filter>
          </div>
          <div class="col-md-4 col-12">
            <report-location-filter
              class="item"
              .value="${this._withDefault(this.queryParams?.location, '-1')}"
            ></report-location-filter>
          </div>
        </div>
        <div class="row padding-v">
          <div class="col-12">
            <checkbox-filter name="incomplete" .value="${this._withDefault(this.queryParams?.incomplete, '')}">
              <span class="checkbox-label">${translate('SHOW_INCOMPLETE_ONLY')}</span>
            </checkbox-filter>
          </div>
        </div>
      </filter-list>
    `;
  }

  stateChanged(state: RootState) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }
  }
}
