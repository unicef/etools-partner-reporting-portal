import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../../../etools-prp-common/elements/page-header.js';
import '../../../etools-prp-common/elements/page-body.js';
import '../../../elements/ip-reporting/indicators-filters.js';
import '../../../elements/ip-reporting/indicators-toolbar.js';
import '../../../elements/list-view-indicators.js';
import Endpoints from '../../../endpoints.js';
import SortingMixin from '../../../etools-prp-common/mixins/sorting-mixin.js';
import {fetchIndicators} from '../../../redux/actions/indicators.js';
import {store} from '../../../redux/store.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/index.js';

@customElement('page-ip-reporting-indicators')
export class PageIpReportingIndicators extends SortingMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: Boolean})
  loading = false;

  @property({type: Boolean})
  isGpd = false;

  @property({type: String})
  workspaceId = '';

  @property({type: String})
  indicatorsUrl = '';

  @property({type: Object})
  queryParams = {};

  render() {
    return html`
      <page-header .title="${translate('INDICATORS')}"></page-header>
      <page-body>
        <indicators-filters ?isGpd="${this.isGpd}"></indicators-filters>
        <indicators-toolbar ?isGpd="${this.isGpd}"></indicators-toolbar>
        <list-view-indicators ?isGpd="${this.isGpd}"></list-view-indicators>
      </page-body>
    `;
  }

  stateChanged(state) {
    if (state.app?.routeDetails?.queryParams && !isJsonStrMatch(this.queryParams, state.app.routeDetails.queryParams)) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.loading !== state.indicators.loading) {
      this.loading = state.indicators.loading;
    }

    if (this.workspaceId !== state.location.id) {
      this.workspaceId = state.location.id;
    }
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('indicatorsUrl') || changedProperties.has('queryParams')) {
      this._indicatorsAjax();
    }

    if (changedProperties.has('workspaceId')) {
      this.indicatorsUrl = this._computeIndicatorsUrl(this.workspaceId);
    }
  }

  _computeIndicatorsUrl(workspaceId) {
    return workspaceId ? Endpoints.allPDIndicators(workspaceId) : '';
  }

  _indicatorsAjax() {
    if (!this.indicatorsUrl || !Object.keys(this.queryParams).length) {
      return;
    }

    store.dispatch(
      fetchIndicators(
        sendRequest({
          method: 'GET',
          endpoint: {url: this.indicatorsUrl},
          params: this.queryParams
        })
      )
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._indicatorsAjax = debounce(this._indicatorsAjax.bind(this), 100);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

export {PageIpReportingIndicators as PageIpReportingIndicatorsEl};
