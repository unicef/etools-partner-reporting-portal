import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
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
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';

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
      this._handleInputChange();
    }

    if (changedProperties.has('locationId')) {
      this.reportsUrl = this._computeProgressReportsUrl();
    }
  }

  stateChanged(state: RootState) {
    if (
      state.app?.routeDetails?.queryParams &&
      !isJsonStrMatch(this.routeDetails, state.app.routeDetails.queryParams)
    ) {
      this.queryParams = state.app?.routeDetails.queryParams;
    }

    if (this.locationId !== state.location.id) {
      this.locationId = state.location.id;
    }
  }

  _computeProgressReportsUrl() {
    return this.locationIdlocationId ? Endpoints.progressReports(this.locationId) : '';
  }

  _handleInputChange() {
    if (!this.reportsUrl || !this.queryParams || !Object.keys(this.queryParams).length) {
      return;
    }

    const progressReports = this.shadowRoot!.getElementById('reports') as EtoolsPrpAjaxEl;

    // Cancel the pending request, if any
    progressReports.abort();

    store.dispatch(progressReportsFetch(progressReports.thunk()));
  }
}
export {PageIpProgressReports as PageIpProgressReportsEl};
