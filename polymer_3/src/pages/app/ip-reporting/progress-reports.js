var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { ReduxConnectedElement } from '../../../etools-prp-common/ReduxConnectedElement';
import { html } from '@polymer/polymer';
import { property } from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../etools-prp-common/elements/page-header';
import '../../../etools-prp-common/elements/page-body';
import '../../../etools-prp-common/elements/etools-prp-ajax';
import '../../../elements/ip-reporting/progress-reports-list';
import '../../../elements/ip-reporting/progress-reports-toolbar';
import '../../../elements/ip-reporting/progress-reports-filters';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../etools-prp-common/mixins/localize-mixin';
import { progressReportsFetch } from '../../../redux/actions/progressReports';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PageIpProgressReports extends LocalizeMixin(ReduxConnectedElement) {
    static get template() {
        return html `
      <style>
        :host {
          display: block;
        }
      </style>

      <iron-location query="{{query}}"> </iron-location>

      <iron-query-params params-string="{{query}}" params-object="{{queryParams}}"> </iron-query-params>

      <etools-prp-ajax id="reports" url="[[reportsUrl]]" params="[[queryParams]]"> </etools-prp-ajax>

      <page-header title="[[localize('progress_reports')]]"></page-header>

      <page-body>
        <progress-reports-filters></progress-reports-filters>
        <progress-reports-toolbar></progress-reports-toolbar>
        <progress-reports-list></progress-reports-list>
      </page-body>
    `;
    }
    static get observers() {
        return ['_handleInputChange(reportsUrl, queryParams)'];
    }
    _computeProgressReportsUrl(locationId) {
        return locationId ? Endpoints.progressReports(locationId) : '';
    }
    _handleInputChange(reportsUrl, queryParams) {
        if (!reportsUrl || !queryParams || !Object.keys(queryParams).length) {
            return;
        }
        const progressReportsThunk = this.$.reports.thunk();
        // Cancel the pending request, if any
        this.$.reports.abort();
        this.reduxStore
            .dispatch(progressReportsFetch(progressReportsThunk))
            // @ts-ignore
            .catch((_err) => {
            // TODO: error handling
        });
    }
}
__decorate([
    property({ type: String, computed: '_computeProgressReportsUrl(locationId)' })
], PageIpProgressReports.prototype, "reportsUrl", void 0);
__decorate([
    property({ type: String, computed: 'getReduxStateValue(rootState.location.id)' })
], PageIpProgressReports.prototype, "locationId", void 0);
__decorate([
    property({ type: Object })
], PageIpProgressReports.prototype, "queryParams", void 0);
window.customElements.define('page-ip-progress-reports', PageIpProgressReports);
