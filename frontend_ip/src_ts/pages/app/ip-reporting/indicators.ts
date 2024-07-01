import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '../../../etools-prp-common/elements/page-header.js';
import '../../../etools-prp-common/elements/page-body.js';
import '../../../etools-prp-common/elements/etools-prp-ajax.js';
import '../../../elements/ip-reporting/indicators-filters.js';
import '../../../elements/ip-reporting/indicators-toolbar.js';
import '../../../elements/list-view-indicators.js';
import Endpoints from '../../../endpoints.js';
import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin.js';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin.js';
import {fetchIndicators} from '../../../redux/actions/indicators.js';
import {store} from '../../../redux/store.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util.js';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax.js';

@customElement('page-ip-reporting-indicators')
export class PageIpReportingIndicators extends LocalizeMixin(SortingMixin(connect(store)(LitElement))) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: Array})
  data = [];

  @property({type: Boolean})
  loading = false;

  @property({type: Number})
  totalResults = 0;

  @property({type: String})
  workspaceId = '';

  @property({type: String})
  indicatorsUrl = '';

  @property({type: String})
  query = '';

  @property({type: Object})
  queryParams = {};

  render() {
    return html`
      <iron-location .query="${this.query}"></iron-location>
      <iron-query-params .paramsString="${this.query}" .paramsObject="${this.queryParams}"></iron-query-params>
      <etools-prp-ajax id="indicators" .url="${this.indicatorsUrl}" .params="${this.queryParams}"></etools-prp-ajax>
      <page-header .title="${this.localize('indicators')}"></page-header>
      <page-body>
        <indicators-filters></indicators-filters>
        <indicators-toolbar></indicators-toolbar>
        <list-view-indicators .data="${this.data}" .totalResults="${this.totalResults}"></list-view-indicators>
      </page-body>
    `;
  }

  stateChanged(state) {
    if (this.data !== state.indicators.all) {
      this.data = state.indicators.all;
    }
    if (this.loading !== state.indicators.loading) {
      this.loading = state.indicators.loading;
    }
    if (this.totalResults !== state.indicators.count) {
      this.totalResults = state.indicators.count;
    }
    if (this.workspaceId !== state.location.id) {
      this.workspaceId = state.location.id;
    }
  }

  updated(changedProperties) {
    if (changedProperties.has('indicatorsUrl') || changedProperties.has('queryParams')) {
      this._indicatorsAjax(this.queryParams);
    }

    if (changedProperties.has('workspaceId')) {
      this.indicatorsUrl = this._computeIndicatorsUrl(this.workspaceId);
    }
  }

  _computeIndicatorsUrl(workspaceId) {
    return Endpoints.allPDIndicators(workspaceId);
  }

  _indicatorsAjax(queryParams) {
    if (!Object.keys(queryParams).length) {
      return;
    }

    debounce(() => {
      const indicatorEl = this.shadowRoot!.getElementById('indicators') as EtoolsPrpAjaxEl;

      // Cancel the pending request, if any
      indicatorEl.abort();

      store.dispatch(fetchIndicators(indicatorEl.thunk()));
    }, 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {PageIpReportingIndicators as PageIpReportingIndicatorsEl};
