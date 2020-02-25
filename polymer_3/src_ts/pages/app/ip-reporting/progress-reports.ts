import {ReduxConnectedElement} from '../../../ReduxConnectedElement';
import {html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/iron-location/iron-location';
import '@polymer/iron-location/iron-query-params';
import '../../../elements/page-header';
import '../../../elements/page-body';
import '../../../elements/etools-prp-ajax';
import {EtoolsPrpAjaxEl} from '../../../elements/etools-prp-ajax';
import '../../../elements/ip-reporting/progress-reports-list';
import '../../../elements/ip-reporting/progress-reports-toolbar';
import '../../../elements/ip-reporting/progress-reports-filters';
import Endpoints from '../../../endpoints';
import LocalizeMixin from '../../../mixins/localize-mixin';
import {GenericObject} from '../../../typings/globals.types';
import {progressReportsFetch} from '../../../redux/actions/progressReports';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin LocalizeMixin
 */
class PageIpProgressReports extends LocalizeMixin(ReduxConnectedElement) {

  public static get template() {
    return html`
    <style>
      :host {
        display:block;
      }
    </style>

     <iron-location
        query="{{query}}">
    </iron-location>

    <iron-query-params
        params-string="{{query}}"
        params-object="{{queryParams}}">
    </iron-query-params>

    <etools-prp-ajax
      id="reports"
      url="[[reportsUrl]]"
      params="[[queryParams]]">
    </etools-prp-ajax>

    <page-header title="[[localize('progress_reports')]]"></page-header>

    <page-body>
      <progress-reports-filters></progress-reports-filters>
      <progress-reports-toolbar></progress-reports-toolbar>
      <progress-reports-list></progress-reports-list>
    </page-body>
`;
  }

  @property({type: String, computed: '_computeProgressReportsUrl(locationId)'})
  reportsUrl!: string;

  @property({type: String, computed: 'getReduxStateValue(rootState.location.id)'})
  locationId!: string;

  @property({type: Object})
  queryParams!: GenericObject;

  public static get observers() {
    return [
      '_handleInputChange(reportsUrl, queryParams)',
    ]
  }

  _computeProgressReportsUrl(locationId: string) {
    return locationId ? Endpoints.progressReports(locationId) : '';
  }

  _handleInputChange(_, queryParams: GenericObject) { // jshint ignore:line
    if (!Object.keys(queryParams).length) {
      return;
    }

    const progressReportsThunk = (this.$.reports as EtoolsPrpAjaxEl).thunk();

    // Cancel the pending request, if any
    (this.$.reports as EtoolsPrpAjaxEl).abort();

    this.reduxStore.dispatch(progressReportsFetch(progressReportsThunk));
    // (dci)
    // .catch(function(err) { // jshint ignore:line
    //   // TODO: error handling
    // }));
  }

}

window.customElements.define('page-ip-progress-reports', PageIpProgressReports);
