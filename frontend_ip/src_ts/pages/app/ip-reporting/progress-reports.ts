import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/iron-location/iron-location.js';
import '@polymer/iron-location/iron-query-params.js';
import '../../../etools-prp-common/elements/page-header.js';
import '../../../etools-prp-common/elements/page-body.js';
import '../../../etools-prp-common/elements/etools-prp-ajax.js';
import {EtoolsPrpAjaxEl} from '../../../etools-prp-common/elements/etools-prp-ajax.js';
import '../../../elements/ip-reporting/progress-reports-list.js';
import '../../../elements/ip-reporting/progress-reports-toolbar.js';
import '../../../elements/ip-reporting/progress-reports-filters.js';
import Endpoints from '../../../endpoints.js';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin.js';
import {progressReportsFetch} from '../../../redux/actions/progressReports.js';
import {store} from '../../../redux/store.js';
import {connect} from 'pwa-helpers';
import {RootState} from '../../../typings/redux.types.js';

@customElement('page-ip-progress-reports')
export class PageIpProgressReports extends LocalizeMixin(connect(store)(LitElement)) {
  static styles = css`
    :host {
      display: block;
    }
  `;

  @property({type: String, attribute: false})
  reportsUrl = '';

  @property({type: String, attribute: false})
  locationId = '';

  @property({type: Object, attribute: false})
  queryParams = {};

  render() {
    return html`
      <iron-location .query="${this.query}" @query-changed="${this._onQueryChanged}"></iron-location>
      <iron-query-params
        .paramsString="${this.query}"
        .paramsObject="${this.queryParams}"
        @params-string-changed=${(e) => (this.query = e.detail.value)}
        @params-object-changed=${(e) => (this.queryParams = e.detail.value)}
      ></iron-query-params>
      <etools-prp-ajax id="reports" .url="${this.reportsUrl}" .params="${this.queryParams}"></etools-prp-ajax>
      <page-header .title="${this.localize('progress_reports')}"></page-header>
      <page-body>
        <progress-reports-filters></progress-reports-filters>
        <progress-reports-toolbar></progress-reports-toolbar>
        <progress-reports-list></progress-reports-list>
      </page-body>
    `;
  }

  updated(changedProperties) {
    super.updated(changedProperties);
    
    if (changedProperties.has('reportsUrl') || changedProperties.has('queryParams')) {
      this._handleInputChange(this.reportsUrl, this.queryParams);
    }

    if (changedProperties.has('locationId')) {
      this.reportsUrl = this._computeProgressReportsUrl(this.locationId);
    }
  }

  stateChanged(state: RootState) {
    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  _onQueryChanged(event) {
    this.query = event.detail.value;
  }

  _onParamsObjectChanged(event) {
    this.queryParams = event.detail.value;
  }

  _computeProgressReportsUrl(locationId) {
    return locationId ? Endpoints.progressReports(locationId) : '';
  }

  _handleInputChange(reportsUrl: string, queryParams: any) {
    if (!reportsUrl || !queryParams || !Object.keys(queryParams).length) {
      return;
    }

    const progressReports = this.shadowRoot!.getElementById('reports') as EtoolsPrpAjaxEl;

    // Cancel the pending request, if any
    progressReports.abort();

    store.dispatch(progressReportsFetch(progressReports.thunk()));
  }
}
export {PageIpProgressReports as PageIpProgressReportsEl};
